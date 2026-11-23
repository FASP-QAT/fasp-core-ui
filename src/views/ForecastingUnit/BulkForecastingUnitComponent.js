import React, { Component } from 'react';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Col,
    FormGroup,
    Input,
    InputGroup,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Alert,
    Table
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import ProductCategoryService from '../../api/PoroductCategoryService';
import TracerCategoryService from '../../api/TracerCategoryService';
import RealmService from '../../api/RealmService';
import UnitService from '../../api/UnitService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import { jExcelLoadedFunction, onOpenFilter } from '../../CommonComponent/JExcelCommonFunctions';

const entityname = i18n.t('static.forecastingunit.forecastingunit');

export default class BulkForecastingUnitComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            realmId: '',
            units: [],
            productCategories: [],
            tracerCategories: [],
            forecastingUnitList: [],
            loading: true,
            isChanged: false,
            lang: localStorage.getItem('lang'),
            message: '',
            color: '',
            validationErrors: [],
            reviewModal: false,
            pendingChangedList: [],
            pendingIndexMap: [],
            totalEdited: 0,
            totalCreated: 0,
            submittedSummaryList: [],
            programsModal: false,
            programsLoading: false,
            selectedEntityName: '',
            programList: []
        };
        this.el = null;
        this.changedRows = new Set();
        this.loadingTable = false;
        this.buildJexcel = this.buildJexcel.bind(this);
        this.addRow = this.addRow.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changed = this.changed.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.confirmUpdate = this.confirmUpdate.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.exportTemplate = this.exportTemplate.bind(this);
        this.dataChangeForRealm = this.dataChangeForRealm.bind(this);
        this.toggleReviewModal = this.toggleReviewModal.bind(this);
        this.toggleProgramsModal = this.toggleProgramsModal.bind(this);
        this.openProgramsModal = this.openProgramsModal.bind(this);
        this.goToError = this.goToError.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    componentDidMount() {
        let userRealmId = AuthenticationService.getRealmId();
        RealmService.getRealmListAll()
            .then(response => {
                if (response.status === 200) {
                    var listArray = response.data || [];
                    listArray.sort((a, b) => {
                        var itemLabelA = (getLabelText(a && a.label, this.state.lang) || '').toUpperCase();
                        var itemLabelB = (getLabelText(b && b.label, this.state.lang) || '').toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    let initialRealmId = userRealmId !== -1 ? userRealmId : (listArray.length > 0 ? listArray[0].realmId : '');
                    this.setState({
                        realms: listArray,
                        realmId: initialRealmId
                    }, () => {
                        this.loadDependencies(initialRealmId);
                    });
                }
            })
            .catch(error => {
                this.handleError(error);
            });
    }

    loadDependencies(realmId) {
        if (!realmId || realmId === '0') return;
        this.setState({ loading: true });

        Promise.allSettled([
            UnitService.getUnitListAll(),
            ProductCategoryService.getProductCategoryListByRealmId(realmId),
            TracerCategoryService.getTracerCategoryByRealmId(realmId),
            ForecastingUnitService.getForcastingUnitByRealmId(realmId)
        ])
            .then(([unitRes, pcRes, tcRes, fuRes]) => {
                let units = (unitRes.status === 'fulfilled' && unitRes.value.data) ? unitRes.value.data : [];
                units.sort((a, b) => {
                    let labelA = a && a.payload ? a.payload.label : (a && a.label);
                    let labelB = b && b.payload ? b.payload.label : (b && b.label);
                    var la = (getLabelText(labelA, this.state.lang) || '').toUpperCase();
                    var lb = (getLabelText(labelB, this.state.lang) || '').toUpperCase();
                    return la > lb ? 1 : -1;
                });
                let unitList = units.map(item => {
                    let p = item.payload || item;
                    return {
                        id: p.unitId !== undefined ? p.unitId : p.id,
                        name: getLabelText(p.label, this.state.lang) || p.unitCode || p.name || ''
                    };
                }).filter(c => c.id !== undefined && c.id !== null && c.name !== '');

                let pcs = (pcRes.status === 'fulfilled' && pcRes.value.data) ? pcRes.value.data : [];
                pcs.sort((a, b) => {
                    let labelA = a && a.payload ? a.payload.label : (a && a.label);
                    let labelB = b && b.payload ? b.payload.label : (b && b.label);
                    var la = (getLabelText(labelA, this.state.lang) || '').toUpperCase();
                    var lb = (getLabelText(labelB, this.state.lang) || '').toUpperCase();
                    return la > lb ? 1 : -1;
                });
                let productCategoryList = pcs.map(item => {
                    let p = item.payload || item;
                    return {
                        id: p.productCategoryId !== undefined ? p.productCategoryId : p.id,
                        name: getLabelText(p.label, this.state.lang) || p.name || ''
                    };
                }).filter(c => c.id !== undefined && c.id !== null && c.name !== '');

                let tcs = (tcRes.status === 'fulfilled' && tcRes.value.data) ? tcRes.value.data : [];
                tcs.sort((a, b) => {
                    let labelA = a && a.payload ? a.payload.label : (a && a.label);
                    let labelB = b && b.payload ? b.payload.label : (b && b.label);
                    var la = (getLabelText(labelA, this.state.lang) || '').toUpperCase();
                    var lb = (getLabelText(labelB, this.state.lang) || '').toUpperCase();
                    return la > lb ? 1 : -1;
                });
                let tracerCategoryList = tcs.map(item => {
                    let p = item.payload || item;
                    return {
                        id: p.tracerCategoryId !== undefined ? p.tracerCategoryId : p.id,
                        name: getLabelText(p.label, this.state.lang) || p.name || ''
                    };
                }).filter(c => c.id !== undefined && c.id !== null && c.name !== '');

                let forecastingUnits = [];
                if (fuRes.status === 'fulfilled' && fuRes.value.data) {
                    forecastingUnits = Array.isArray(fuRes.value.data) ? fuRes.value.data : [];
                } else if (fuRes.status === 'rejected') {
                    if (fuRes.reason && fuRes.reason.response && fuRes.reason.response.status === 404) {
                        forecastingUnits = [];
                    } else if (unitRes.status === 'rejected' || pcRes.status === 'rejected' || tcRes.status === 'rejected') {
                        this.handleError(fuRes.reason || unitRes.reason || pcRes.reason || tcRes.reason);
                        return;
                    } else {
                        forecastingUnits = [];
                    }
                }

                forecastingUnits.sort((a, b) => {
                    var la = (getLabelText(a && a.label, this.state.lang) || '').toUpperCase();
                    var lb = (getLabelText(b && b.label, this.state.lang) || '').toUpperCase();
                    return la > lb ? 1 : -1;
                });

                this.changedRows = new Set();
                this.setState({
                    units: unitList,
                    productCategories: productCategoryList,
                    tracerCategories: tracerCategoryList,
                    forecastingUnitList: forecastingUnits,
                    loading: false
                }, () => {
                    this.buildJexcel();
                });
            })
            .catch(error => {
                this.handleError(error);
            });
    }

    dataChangeForRealm(e) {
        let newRealmId = e.target.value;
        this.setState({ realmId: newRealmId, isChanged: false, validationErrors: [] }, () => {
            this.loadDependencies(newRealmId);
        });
    }

    buildJexcel() {
        let container = document.getElementById("forecastingUnitTableDiv");
        if (container) {
            jexcel.destroy(container, true);
        }

        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        let data = [];
        let { forecastingUnitList } = this.state;
        for (let i = 0; i < forecastingUnitList.length; i++) {
            let fu = forecastingUnitList[i];
            let genericName = fu.genericLabel ? (fu.genericLabel.label_en || getLabelText(fu.genericLabel, this.state.lang) || '') : '';
            let fuName = fu.label ? (fu.label.label_en || getLabelText(fu.label, this.state.lang) || '') : '';
            let pcId = fu.productCategory ? (fu.productCategory.id !== undefined ? fu.productCategory.id : fu.productCategory.productCategoryId) : '';
            let tcId = fu.tracerCategory ? (fu.tracerCategory.id !== undefined ? fu.tracerCategory.id : fu.tracerCategory.tracerCategoryId) : '';
            let uId = fu.unit ? (fu.unit.id !== undefined ? fu.unit.id : fu.unit.unitId) : '';
            // Row follows manual entry order:
            // 0: ID, 1: Tracer Category, 2: Product Category, 3: Forecasting Unit, 4: Generic Name, 5: Unit, 6: Status, 7: isChanged
            let row = [
                fu.forecastingUnitId,
                tcId !== undefined && tcId !== null ? tcId : '',
                pcId !== undefined && pcId !== null ? pcId : '',
                fuName,
                genericName,
                uId !== undefined && uId !== null ? uId : '',
                fu.active ? '1' : '0',
                0 // isChanged: 0
            ];
            data.push(row);
        }

        let options = {
            data: data,
            columnDrag: false,
            columns: [
                { title: i18n.t('static.forecastingUnit.forecastingUnitId'), type: 'text', readOnly: true, width: 100 },
                { title: `${i18n.t('static.tracercategory.tracercategory')} *`, type: 'dropdown', source: this.state.tracerCategories, width: 220, autocomplete: true },
                { title: `${i18n.t('static.productcategory.productcategory')} *`, type: 'dropdown', source: this.state.productCategories, width: 220, autocomplete: true },
                { title: `${i18n.t('static.forecastingunit.forecastingunit')} *`, type: 'text', width: 280 },
                { title: i18n.t('static.product.productgenericname'), type: 'text', width: 240 },
                { title: `${i18n.t('static.unit.unit')} *`, type: 'dropdown', source: this.state.units, width: 180, autocomplete: true },
                { title: i18n.t('static.common.status'), type: 'dropdown', source: [{ id: '1', name: i18n.t('static.common.active') }, { id: '0', name: i18n.t('static.dataentry.inactive') }], width: 110 },
                { title: 'isChanged', type: 'hidden' }
            ],
            pagination: localStorage.getItem("sesRecordCount"),
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteColumn: false,
            allowInsertRow: true,
            allowManualInsertRow: false,
            allowDeleteRow: true,
            copyCompatibility: true,
            parseFormulas: true,
            license: JEXCEL_PRO_KEY,
            allowRenameColumn: false,
            onopenfilter: onOpenFilter,
            contextMenu: function (obj, x, y, e) {
                let items = [];
                items.push({
                    title: i18n.t('static.common.addRow'),
                    onclick: function () {
                        this.addRow(1);
                    }.bind(this)
                });
                if (y != null) {
                    let rowId = obj.getValueFromCoords(0, y);
                    let rowName = obj.getValueFromCoords(3, y);
                    if (rowId && parseInt(rowId) > 0) {
                        items.push({
                            title: i18n.t('static.program.viewProgramsUsingEntity', { entityname: i18n.t('static.forecastingunit.forecastingunit') }),
                            onclick: function () {
                                this.openProgramsModal(parseInt(rowId), rowName);
                            }.bind(this)
                        });
                    }
                    items.push({
                        title: i18n.t('static.common.deleterow'),
                        onclick: function () {
                            let rowIdx = parseInt(y);
                            obj.deleteRow(rowIdx);
                            let updatedSet = new Set();
                            this.changedRows.forEach(idx => {
                                if (idx < rowIdx) {
                                    updatedSet.add(idx);
                                } else if (idx > rowIdx) {
                                    updatedSet.add(idx - 1);
                                }
                            });
                            this.changedRows = updatedSet;
                            let remainingJson = obj.getJson(null, false);
                            let hasChanges = false;
                            for (let r = 0; r < remainingJson.length; r++) {
                                let rId = remainingJson[r][0] ? parseInt(remainingJson[r][0]) : 0;
                                if (this.changedRows.has(r) || rId === 0) {
                                    hasChanges = true;
                                    break;
                                }
                            }
                            this.setState({ isChanged: hasChanges });
                        }.bind(this)
                    });
                }
                return items;
            }.bind(this),
            onchange: this.changed,
            onbeforepaste: function (instance, data, x, y) {
                if (data && data.length > 0) {
                    let targetY = y !== undefined && y !== null ? parseInt(y) : 0;
                    let totalRows = instance.getJson(null, false).length;
                    let neededRows = (targetY + data.length) - totalRows;
                    if (neededRows > 0) {
                        for (let k = 0; k < neededRows; k++) {
                            instance.insertRow([0, '', '', '', '', '', '1', 1]);
                        }
                    }
                }
                return data;
            }.bind(this),
            onpaste: this.onPaste,
            onload: function (instance) {
                jExcelLoadedFunction(instance);
                let filter = document.querySelector('#forecastingUnitTableDiv .jss_pagination .order-1');
                if (filter) {
                    filter.classList.add('mr-2');
                }
                this.loadingTable = false;
            }.bind(this)
        };

        this.loadingTable = true;
        this.el = jexcel(document.getElementById("forecastingUnitTableDiv"), options);
    }

    changed(instance, cell, x, y, value) {
        if (this.loadingTable) return;
        if (x !== 7) {
            this.changedRows.add(parseInt(y));
            this.el.setValueFromCoords(7, y, 1, true);
            if (!this.state.isChanged) {
                this.setState({ isChanged: true });
            }
        }
    }

    oneditionend(instance, cell, x, y, value) {
        // Handled cleanly via onchange
    }

    onPaste() {
        this.setState({ isChanged: true });
        setTimeout(() => {
            let json = this.el.getJson(null, false);
            for (let y = 0; y < json.length; y++) {
                if (!json[y][0] || json[y][0] === '' || json[y][0] === 0 || json[y][0] === '0') {
                    this.el.setValueFromCoords(0, y, 0, true);
                    this.el.setValueFromCoords(7, y, 1, true);
                    this.changedRows.add(y);
                }
                // Col 1: Tracer Category
                let tcVal = json[y][1];
                if (tcVal && isNaN(parseInt(tcVal))) {
                    let found = this.state.tracerCategories.find(tc => tc.name.toLowerCase() === String(tcVal).trim().toLowerCase());
                    if (found) {
                        this.el.setValueFromCoords(1, y, found.id, true);
                    }
                }
                // Col 2: Product Category
                let pcVal = json[y][2];
                if (pcVal && isNaN(parseInt(pcVal))) {
                    let found = this.state.productCategories.find(pc => pc.name.toLowerCase() === String(pcVal).trim().toLowerCase());
                    if (found) {
                        this.el.setValueFromCoords(2, y, found.id, true);
                    }
                }
                // Col 5: Unit
                let uVal = json[y][5];
                if (uVal && isNaN(parseInt(uVal))) {
                    let found = this.state.units.find(u => u.name.toLowerCase() === String(uVal).trim().toLowerCase());
                    if (found) {
                        this.el.setValueFromCoords(5, y, found.id, true);
                    }
                }
                // Col 6: Status
                let stVal = json[y][6];
                if (stVal !== undefined && stVal !== null && stVal !== '') {
                    let stLower = String(stVal).toLowerCase();
                    if (stLower === 'active' || stLower === '1') {
                        this.el.setValueFromCoords(6, y, '1', true);
                    } else if (stLower === 'disabled' || stLower === 'inactive' || stLower === '0') {
                        this.el.setValueFromCoords(6, y, '0', true);
                    }
                } else {
                    this.el.setValueFromCoords(6, y, '1', true);
                }
            }
        }, 100);
    }

    addRow(count = 1) {
        let n = parseInt(count);
        if (isNaN(n) || n <= 0) n = 1;
        let totalRows = this.el.getJson(null, false).length;
        for (let i = 0; i < n; i++) {
            let row = [
                0,   // 0: ID
                '',  // 1: Tracer Category
                '',  // 2: Product Category
                '',  // 3: Forecasting Unit Name
                '',  // 4: Generic Name
                '',  // 5: Unit
                '1', // 6: Status
                1    // 7: isChanged
            ];
            this.el.insertRow(row);
            this.changedRows.add(totalRows + i);
        }
        this.setState({ isChanged: true });

        setTimeout(() => {
            let pageSize = 50;
            let pageSelect = document.getElementsByClassName('jss_pagination_dropdown')[0];
            if (pageSelect && pageSelect.value && !isNaN(parseInt(pageSelect.value))) {
                pageSize = parseInt(pageSelect.value);
            }
            let newTotal = totalRows + n;
            let targetPage = Math.floor((newTotal - 1) / pageSize);
            if (this.el && typeof this.el.page === 'function') {
                this.el.page(targetPage);
            }
        }, 50);
    }

    resetClicked() {
        this.changedRows = new Set();
        this.setState({ isChanged: false, validationErrors: [] }, () => {
            this.buildJexcel();
        });
    }

    exportTemplate() {
        let workbook = new Workbook();
        let sheetName = i18n.t('static.forecastingUnit.bulkEdit').replace(/[*?:\\/[\]]/g, ' ').substring(0, 31).trim();
        let worksheet = workbook.addWorksheet(sheetName);

        let lookupSheet = workbook.addWorksheet('LookupData');
        lookupSheet.state = 'hidden';

        let tcList = this.state.tracerCategories.map(tc => tc.name).filter(Boolean);
        let pcList = this.state.productCategories.map(pc => pc.name).filter(Boolean);
        let uList = this.state.units.map(u => u.name).filter(Boolean);

        lookupSheet.columns = [
            { header: 'Tracer Categories', key: 'tc', width: 30 },
            { header: 'Product Categories', key: 'pc', width: 30 },
            { header: 'Units', key: 'unit', width: 25 }
        ];

        let maxRows = Math.max(tcList.length, pcList.length, uList.length);
        for (let r = 0; r < maxRows; r++) {
            lookupSheet.addRow([
                tcList[r] || '',
                pcList[r] || '',
                uList[r] || ''
            ]);
        }

        // Ordered exactly as manual entry screen, NO ID, NO Status
        worksheet.columns = [
            { header: i18n.t('static.tracercategory.tracercategory') + ' *', key: 'tc', width: 30 },
            { header: i18n.t('static.productcategory.productcategory') + ' *', key: 'pc', width: 30 },
            { header: i18n.t('static.forecastingunit.forecastingunit') + ' *', key: 'name', width: 35 },
            { header: i18n.t('static.product.productgenericname'), key: 'generic', width: 30 },
            { header: i18n.t('static.unit.unit') + ' *', key: 'unit', width: 25 }
        ];

        worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFECECEC' }
            };
            cell.font = { bold: true };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        // Dropdowns for rows 2 to 2000
        if (tcList.length > 0) {
            worksheet.dataValidations.add('A2:A2000', {
                type: 'list',
                allowBlank: true,
                formulae: [`LookupData!$A$2:$A$${tcList.length + 1}`],
                showErrorMessage: true
            });
        }

        if (pcList.length > 0) {
            worksheet.dataValidations.add('B2:B2000', {
                type: 'list',
                allowBlank: true,
                formulae: [`LookupData!$B$2:$B$${pcList.length + 1}`],
                showErrorMessage: true
            });
        }

        if (uList.length > 0) {
            worksheet.dataValidations.add('E2:E2000', {
                type: 'list',
                allowBlank: true,
                formulae: [`LookupData!$C$2:$C$${uList.length + 1}`],
                showErrorMessage: true
            });
        }

        let sampleTc = tcList.length > 0 ? tcList[0] : 'Sample Tracer';
        let samplePc = pcList.length > 0 ? pcList[0] : 'Sample Category';
        let sampleU = uList.length > 0 ? uList[0] : 'Sample Unit';
        worksheet.addRow([sampleTc, samplePc, 'Example Forecasting Unit Name', 'Example Generic Name', sampleU]);

        workbook.xlsx.writeBuffer().then(data => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `${i18n.t('static.forecastingUnit.bulkEdit')}_Template.xlsx`);
        });
    }

    openProgramsModal(fuId, fuName) {
        this.setState({
            programsModal: true,
            programsLoading: true,
            selectedEntityName: fuName || '',
            programList: []
        });
        ForecastingUnitService.getForcastingUnitByIdWithPrograms(fuId)
            .then(response => {
                if (response.status === 200 && response.data) {
                    let list = [];
                    (response.data.spProgramListActive || []).forEach(p => {
                        list.push({ code: p.code, module: 'Supply Planning', status: 1 });
                    });
                    (response.data.fcProgramListActive || []).forEach(p => {
                        list.push({ code: p.code, module: 'Forecasting', status: 1 });
                    });
                    (response.data.spProgramListDisabled || []).forEach(p => {
                        list.push({ code: p.code, module: 'Supply Planning', status: 0 });
                    });
                    (response.data.fcProgramListDisabled || []).forEach(p => {
                        list.push({ code: p.code, module: 'Forecasting', status: 0 });
                    });
                    list.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
                    this.setState({ programList: list, programsLoading: false });
                } else {
                    this.setState({ programsLoading: false });
                }
            })
            .catch(err => {
                this.setState({ programsLoading: false });
            });
    }

    toggleProgramsModal() {
        this.setState({ programsModal: !this.state.programsModal });
    }

    checkValidation() {
        let valid = true;
        let errors = [];
        let json = this.el.getJson(null, false);
        let pageSize = 50;
        let pageSelect = document.getElementsByClassName('jss_pagination_dropdown')[0];
        if (pageSelect && pageSelect.value && !isNaN(parseInt(pageSelect.value))) {
            pageSize = parseInt(pageSelect.value);
        }

        let seenNames = new Map();
        let colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

        for (let y = 0; y < json.length; y++) {
            let row = json[y];
            let pageNum = Math.floor(y / pageSize) + 1;
            let fuId = row[0] ? parseInt(row[0]) : 0;
            let isRowChanged = this.changedRows.has(y) || fuId === 0 || row[7] === 1 || row[7] === '1' || parseInt(this.el.getValueFromCoords(7, y)) === 1;

            let tcId = row[1];
            if (tcId && isNaN(parseInt(tcId))) {
                let found = this.state.tracerCategories.find(tc => tc.name.toLowerCase() === String(tcId).trim().toLowerCase());
                if (found) tcId = found.id;
            }
            let pcId = row[2];
            if (pcId && isNaN(parseInt(pcId))) {
                let found = this.state.productCategories.find(pc => pc.name.toLowerCase() === String(pcId).trim().toLowerCase());
                if (found) pcId = found.id;
            }
            let fuName = row[3] ? row[3].toString().trim() : '';
            let genericName = row[4] ? row[4].toString().trim() : '';
            let unitId = row[5];
            if (unitId && isNaN(parseInt(unitId))) {
                let found = this.state.units.find(u => u.name.toLowerCase() === String(unitId).trim().toLowerCase());
                if (found) unitId = found.id;
            }

            // Ignore completely blank new rows
            let isCompletelyEmpty = (!tcId || tcId === '') && (!pcId || pcId === '') && (fuName === '') && (!unitId || unitId === '') && (genericName === '');
            if (fuId === 0 && isCompletelyEmpty) {
                continue;
            }

            if (!isRowChanged) {
                let existingName = fuName.toLowerCase();
                if (existingName !== '') {
                    seenNames.set(existingName, y);
                }
                continue;
            }

            let identifier = fuId > 0
                ? `${i18n.t('static.bulk.id')}: ${fuId}`
                : (fuName !== '' ? `${i18n.t('static.bulk.name')}: "${fuName}"` : `${i18n.t('static.bulk.row')}: ${y + 1}`);

            // Clear previous styles for this row (Cols 1 to 5)
            for (let c = 1; c <= 5; c++) {
                let cellCoord = colLetters[c] + (y + 1);
                this.el.setStyle(cellCoord, "background-color", "transparent");
                this.el.setComments(cellCoord, "");
            }

            // Col 1: Tracer Category required
            if (tcId === '' || tcId === null || tcId === undefined) {
                let cellCoord = "B" + (y + 1);
                this.el.setStyle(cellCoord, "background-color", "yellow");
                this.el.setComments(cellCoord, i18n.t('static.label.fieldRequired'));
                errors.push({
                    page: pageNum,
                    row: y + 1,
                    identifier: identifier,
                    field: i18n.t('static.tracercategory.tracercategory'),
                    message: i18n.t('static.label.fieldRequired'),
                    coord: cellCoord
                });
                valid = false;
            }

            // Col 2: Product Category required
            if (pcId === '' || pcId === null || pcId === undefined) {
                let cellCoord = "C" + (y + 1);
                this.el.setStyle(cellCoord, "background-color", "yellow");
                this.el.setComments(cellCoord, i18n.t('static.label.fieldRequired'));
                errors.push({
                    page: pageNum,
                    row: y + 1,
                    identifier: identifier,
                    field: i18n.t('static.productcategory.productcategory'),
                    message: i18n.t('static.label.fieldRequired'),
                    coord: cellCoord
                });
                valid = false;
            }

            // Col 3: Forecasting Unit Name required and unique
            if (fuName === '') {
                let cellCoord = "D" + (y + 1);
                this.el.setStyle(cellCoord, "background-color", "yellow");
                this.el.setComments(cellCoord, i18n.t('static.label.fieldRequired'));
                errors.push({
                    page: pageNum,
                    row: y + 1,
                    identifier: identifier,
                    field: i18n.t('static.forecastingunit.forecastingunit'),
                    message: i18n.t('static.label.fieldRequired'),
                    coord: cellCoord
                });
                valid = false;
            } else {
                let lowerName = fuName.toLowerCase();
                if (seenNames.has(lowerName)) {
                    let prevRow = seenNames.get(lowerName);
                    let cellCoord = "D" + (y + 1);
                    this.el.setStyle(cellCoord, "background-color", "yellow");
                    let dupMsg = `${i18n.t('static.bulk.duplicateInSheet')} (${i18n.t('static.bulk.row')} ${prevRow + 1})`;
                    this.el.setComments(cellCoord, dupMsg);
                    errors.push({
                        page: pageNum,
                        row: y + 1,
                        identifier: identifier,
                        field: i18n.t('static.forecastingunit.forecastingunit'),
                        message: dupMsg,
                        coord: cellCoord
                    });
                    valid = false;
                } else {
                    seenNames.set(lowerName, y);
                }
            }

            // Col 5: Unit required
            if (unitId === '' || unitId === null || unitId === undefined) {
                let cellCoord = "F" + (y + 1);
                this.el.setStyle(cellCoord, "background-color", "yellow");
                this.el.setComments(cellCoord, i18n.t('static.label.fieldRequired'));
                errors.push({
                    page: pageNum,
                    row: y + 1,
                    identifier: identifier,
                    field: i18n.t('static.unit.unit'),
                    message: i18n.t('static.label.fieldRequired'),
                    coord: cellCoord
                });
                valid = false;
            }
        }

        this.setState({ validationErrors: errors });
        return valid;
    }

    goToError(errorItem) {
        if (this.el && errorItem.page) {
            this.el.page(errorItem.page - 1);
        }
    }

    formSubmit() {
        let isValid = this.checkValidation();
        if (!isValid) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        let json = this.el.getJson(null, false);
        let changedList = [];
        let indexMap = [];
        let submittedSummaryList = [];
        let currentRealmId = parseInt(this.state.realmId);

        for (let y = 0; y < json.length; y++) {
            let row = json[y];
            let fuId = row[0] ? parseInt(row[0]) : 0;
            let isRowChanged = this.changedRows.has(y) || fuId === 0 || row[7] === 1 || row[7] === '1' || parseInt(this.el.getValueFromCoords(7, y)) === 1;

            let tcId = parseInt(row[1]);
            if (isNaN(tcId) && row[1]) {
                let found = this.state.tracerCategories.find(tc => tc.name.toLowerCase() === String(row[1]).trim().toLowerCase());
                if (found) tcId = found.id;
            }
            let pcId = parseInt(row[2]);
            if (isNaN(pcId) && row[2]) {
                let found = this.state.productCategories.find(pc => pc.name.toLowerCase() === String(row[2]).trim().toLowerCase());
                if (found) pcId = found.id;
            }
            let fuName = row[3] ? row[3].toString().trim() : '';
            let genericName = row[4] ? row[4].toString().trim() : '';
            let uId = parseInt(row[5]);
            if (isNaN(uId) && row[5]) {
                let found = this.state.units.find(u => u.name.toLowerCase() === String(row[5]).trim().toLowerCase());
                if (found) uId = found.id;
            }
            let isActive = row[6] === 1 || row[6] === '1' || row[6] === true || row[6] === 'true' || String(row[6]).toLowerCase() === 'active';

            // Ignore completely blank new rows
            let isCompletelyEmpty = (isNaN(tcId) || !tcId) && (isNaN(pcId) || !pcId) && (fuName === '') && (isNaN(uId) || !uId) && (genericName === '');
            if (fuId === 0 && isCompletelyEmpty) {
                continue;
            }

            if (isRowChanged) {
                let tcObj = this.state.tracerCategories.find(tc => tc.id === tcId);
                let tcName = tcObj ? tcObj.name : tcId;
                let pcObj = this.state.productCategories.find(pc => pc.id === pcId);
                let pcName = pcObj ? pcObj.name : pcId;
                let uObj = this.state.units.find(u => u.id === uId);
                let uName = uObj ? uObj.name : uId;
                let statusName = isActive ? i18n.t('static.common.active') : i18n.t('static.dataentry.inactive');

                let changes = [];
                let isNew = fuId === 0;

                if (isNew) {
                    changes.push({ field: i18n.t('static.tracercategory.tracercategory'), newVal: tcName });
                    changes.push({ field: i18n.t('static.productcategory.productcategory'), newVal: pcName });
                    changes.push({ field: i18n.t('static.forecastingunit.forecastingunit'), newVal: fuName });
                    if (genericName) {
                        changes.push({ field: i18n.t('static.product.productgenericname'), newVal: genericName });
                    }
                    changes.push({ field: i18n.t('static.unit.unit'), newVal: uName });
                    changes.push({ field: i18n.t('static.common.status'), newVal: statusName });
                } else {
                    let orig = this.state.forecastingUnitList.find(f => f.forecastingUnitId === fuId);
                    if (orig) {
                        let origTcId = orig.tracerCategory ? (orig.tracerCategory.id !== undefined ? orig.tracerCategory.id : orig.tracerCategory.tracerCategoryId) : '';
                        let origPcId = orig.productCategory ? (orig.productCategory.id !== undefined ? orig.productCategory.id : orig.productCategory.productCategoryId) : '';
                        let origUId = orig.unit ? (orig.unit.id !== undefined ? orig.unit.id : orig.unit.unitId) : '';
                        let origFuName = orig.label ? (orig.label.label_en || getLabelText(orig.label, this.state.lang) || '') : '';
                        let origGeneric = orig.genericLabel ? (orig.genericLabel.label_en || getLabelText(orig.genericLabel, this.state.lang) || '') : '';
                        let origActive = !!orig.active;

                        if (parseInt(origTcId) !== parseInt(tcId)) {
                            let oldTcObj = this.state.tracerCategories.find(tc => tc.id === origTcId);
                            changes.push({ field: i18n.t('static.tracercategory.tracercategory'), oldVal: oldTcObj ? oldTcObj.name : origTcId, newVal: tcName });
                        }
                        if (parseInt(origPcId) !== parseInt(pcId)) {
                            let oldPcObj = this.state.productCategories.find(pc => pc.id === origPcId);
                            changes.push({ field: i18n.t('static.productcategory.productcategory'), oldVal: oldPcObj ? oldPcObj.name : origPcId, newVal: pcName });
                        }
                        if (origFuName.trim() !== fuName.trim()) {
                            changes.push({ field: i18n.t('static.forecastingunit.forecastingunit'), oldVal: origFuName, newVal: fuName });
                        }
                        if (origGeneric.trim() !== genericName.trim()) {
                            changes.push({ field: i18n.t('static.product.productgenericname'), oldVal: origGeneric, newVal: genericName });
                        }
                        if (parseInt(origUId) !== parseInt(uId)) {
                            let oldUObj = this.state.units.find(u => u.id === origUId);
                            changes.push({ field: i18n.t('static.unit.unit'), oldVal: oldUObj ? oldUObj.name : origUId, newVal: uName });
                        }
                        if (origActive !== isActive) {
                            changes.push({ field: i18n.t('static.common.status'), oldVal: origActive ? i18n.t('static.common.active') : i18n.t('static.dataentry.inactive'), newVal: statusName });
                        }
                    }

                    // If existing unit has NO actual field changes, skip it!
                    if (changes.length === 0) {
                        this.changedRows.delete(y);
                        this.el.setValueFromCoords(7, y, 0, true);
                        continue;
                    }
                }

                let fuObj = {
                    forecastingUnitId: fuId,
                    realm: {
                        id: currentRealmId
                    },
                    tracerCategory: {
                        id: tcId
                    },
                    productCategory: {
                        id: pcId
                    },
                    genericLabel: {
                        label_en: genericName
                    },
                    label: {
                        label_en: fuName
                    },
                    unit: {
                        id: uId
                    },
                    active: isActive
                };
                changedList.push(fuObj);
                indexMap.push(y);

                submittedSummaryList.push({
                    id: fuId,
                    name: fuName || `(${i18n.t('static.bulk.newCreatedName')})`,
                    action: isNew ? 'created' : 'edited',
                    changes: changes
                });
            }
        }

        if (changedList.length === 0) {
            this.setState({
                message: i18n.t('static.bulk.noChanges'),
                color: 'danger'
            }, () => {
                hideSecondComponent();
            });
            return;
        }

        let totalCreated = submittedSummaryList.filter(s => s.action === 'created').length;
        let totalEdited = submittedSummaryList.filter(s => s.action === 'edited').length;

        this.setState({
            reviewModal: true,
            pendingChangedList: changedList,
            pendingIndexMap: indexMap,
            totalCreated: totalCreated,
            totalEdited: totalEdited,
            submittedSummaryList: submittedSummaryList
        });
    }

    confirmUpdate() {
        this.setState({ reviewModal: false, loading: true });
        ForecastingUnitService.addForecastingUnitBulk(this.state.pendingChangedList)
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        isChanged: false,
                        message: 'static.message.updateSuccess',
                        color: 'green',
                        loading: false
                    }, () => {
                        this.props.history.push(`/forecastingUnit/listForecastingUnit/green/${this.state.message}`);
                    });
                } else {
                    this.setState({
                        message: response.data ? response.data.messageCode : 'static.actionFailed',
                        color: 'red',
                        loading: false
                    }, () => {
                        hideSecondComponent();
                    });
                }
            })
            .catch(error => {
                this.handleError(error);
            });
    }

    toggleReviewModal() {
        this.setState({ reviewModal: !this.state.reviewModal });
    }

    cancelClicked() {
        this.props.history.push(`/forecastingUnit/listForecastingUnit`);
    }

    handleError(error) {
        if (error.message === "Network Error") {
            this.setState({
                message: API_URL.includes("uat")
                    ? i18n.t("static.common.uatNetworkErrorMessage")
                    : (API_URL.includes("demo")
                        ? i18n.t("static.common.demoNetworkErrorMessage")
                        : i18n.t("static.common.prodNetworkErrorMessage")),
                loading: false,
                color: 'red'
            });
        } else {
            switch (error.response ? error.response.status : "") {
                case 401:
                    this.props.history.push(`/login/static.message.sessionExpired`);
                    break;
                case 409:
                    this.setState({
                        message: i18n.t('static.common.accessDenied'),
                        loading: false,
                        color: "red",
                    });
                    break;
                case 403:
                    this.props.history.push(`/accessDenied`);
                    break;
                default:
                    this.setState({
                        message: (error.response && error.response.data && error.response.data.messageCode) ? error.response.data.messageCode : 'static.unkownError',
                        loading: false,
                        color: 'red'
                    });
                    break;
            }
        }
    }

    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { realms, realmId, validationErrors, submittedSummaryList } = this.state;
        let realmList = realms.length > 0 && realms.map((item, i) => (
            <option key={i} value={item.realmId}>
                {getLabelText(item.label, this.state.lang)}
            </option>
        ));

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent
                    history={this.props.history}
                    message={(message) => this.setState({ message })}
                    loading={(loading) => this.setState({ loading })}
                />
                <h5 className={this.state.color} id="div2">
                    {i18n.t(this.state.message, { entityname })}
                </h5>

                {validationErrors.length > 0 && (
                    <Alert color="danger" className="mb-3">
                        <h6 className="alert-heading">
                            <strong>{i18n.t('static.bulk.validationErrors')} ({validationErrors.length}):</strong>
                        </h6>
                        <ul className="mb-0 pl-3">
                            {validationErrors.slice(0, 10).map((err, idx) => (
                                <li key={idx} style={{ cursor: 'pointer' }} onClick={() => this.goToError(err)}>
                                    <span className="badge badge-warning mr-2">
                                        {i18n.t('static.bulk.page')} {err.page}, {i18n.t('static.bulk.row')} {err.row}
                                    </span>
                                    <strong>{err.identifier}</strong>: {err.field} - {err.message}
                                    <span className="ml-2 text-primary"><u>[{i18n.t('static.bulk.goToPage')}]</u></span>
                                </li>
                            ))}
                            {validationErrors.length > 10 && (
                                <li className="text-muted mt-1">...and {validationErrors.length - 10} more error(s).</li>
                            )}
                        </ul>
                    </Alert>
                )}

                <Card>
                    <div className="Card-header-addicon">
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a
                                    href="javascript:void(0);"
                                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                                    title={i18n.t('static.bulk.downloadTemplateBulkAdding')}
                                    onClick={this.exportTemplate}
                                >
                                    <small className="supplyplanformulas">{i18n.t('static.dataentry.downloadTemplate')}</small>
                                </a>
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0">
                        {AuthenticationService.getRealmId() === -1 && (
                            <Col md="3 pl-0">
                                <div className="d-md-flex Selectdiv2">
                                    <FormGroup className="mt-md-2 mb-md-2" id="realmDiv">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="realmId"
                                                    id="realmId"
                                                    bsSize="sm"
                                                    value={realmId}
                                                    onChange={this.dataChangeForRealm}
                                                >
                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                    {realmList}
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                </div>
                            </Col>
                        )}

                        <div className="consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                            <div id="forecastingUnitTableDiv"></div>
                        </div>

                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }}>
                                <div className="align-items-center">
                                    <h4><strong>{i18n.t('static.common.loading')}</strong></h4>
                                    <div className="spinner-border blue ml-4" role="status"></div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                    <CardFooter>
                        <FormGroup className="mb-0">
                            <Button
                                type="button"
                                size="md"
                                color="danger"
                                className="float-right mr-1"
                                onClick={this.cancelClicked}
                                disabled={this.state.loading}
                            >
                                <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}
                            </Button>
                            <Button
                                type="button"
                                size="md"
                                color="warning"
                                className="float-right mr-1 text-white"
                                onClick={this.resetClicked}
                                disabled={this.state.loading}
                            >
                                <i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}
                            </Button>
                            <Button
                                type="submit"
                                size="md"
                                color="success"
                                className="float-right mr-1"
                                onClick={this.formSubmit}
                                disabled={!this.state.isChanged || this.state.loading}
                            >
                                <i className="fa fa-check"></i> {i18n.t('static.common.submit')}
                            </Button>
                            <Button
                                color="info"
                                size="md"
                                className="float-right mr-1"
                                type="button"
                                onClick={() => this.addRow(1)}
                                disabled={this.state.loading}
                            >
                                <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}
                            </Button>
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>

                {/* Programs Modal (Point 1) */}
                <Modal isOpen={this.state.programsModal} toggle={this.toggleProgramsModal} className="modal-md">
                    <ModalHeader toggle={this.toggleProgramsModal}>
                        <strong>{i18n.t('static.program.programsUsingEntity', { entityname: this.state.selectedEntityName })}</strong>
                    </ModalHeader>
                    <ModalBody>
                        {this.state.programsLoading ? (
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "150px" }}>
                                <div className="spinner-border blue" role="status"></div>
                            </div>
                        ) : (
                            <div>
                                {this.state.programList.length === 0 ? (
                                    <p className="text-muted text-center my-3">{i18n.t('static.program.noProgramsFound')}</p>
                                ) : (
                                    <Table hover responsive size="sm" className="table-bordered mt-2">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>{i18n.t('static.program.programMaster')}</th>
                                                <th>{i18n.t('static.realm.module')}</th>
                                                <th>{i18n.t('static.common.status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.programList.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td><strong>{item.code}</strong></td>
                                                    <td>{item.module}</td>
                                                    <td>
                                                        <span className={`badge ${item.status === 1 ? 'badge-success' : 'badge-secondary'}`}>
                                                            {item.status === 1 ? i18n.t('static.common.active') : i18n.t('static.dataentry.inactive')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            type="button"
                            size="md"
                            color="danger"
                            className="float-right mr-1"
                            onClick={this.toggleProgramsModal}
                        >
                            <i className="fa fa-times"></i> {i18n.t('static.common.close')}
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Submission Review Modal */}
                <Modal isOpen={this.state.reviewModal} toggle={this.toggleReviewModal} className="modal-lg">
                    <ModalHeader toggle={this.toggleReviewModal}>
                        <strong>{i18n.t('static.bulk.reviewChanges')}</strong>
                    </ModalHeader>
                    <ModalBody style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <p>{i18n.t('static.bulk.reviewPrompt')}</p>
                        <Row className="mb-3">
                            <Col md="6">
                                <Alert color="info" className="mb-0">
                                    <strong>{i18n.t('static.bulk.unitsEdited')}:</strong> {this.state.totalEdited}
                                </Alert>
                            </Col>
                            <Col md="6">
                                <Alert color="success" className="mb-0">
                                    <strong>{i18n.t('static.bulk.unitsCreated')}:</strong> {this.state.totalCreated}
                                </Alert>
                            </Col>
                        </Row>
                        <Table hover responsive size="sm" className="table-bordered">
                            <thead className="thead-light">
                                <tr>
                                    <th style={{ width: '80px' }}>{i18n.t('static.bulk.id')}</th>
                                    <th>{i18n.t('static.bulk.name')}</th>
                                    <th style={{ width: '100px' }}>{i18n.t('static.bulk.action')}</th>
                                    <th>{i18n.t('static.bulk.changes')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submittedSummaryList.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.id > 0 ? item.id : '-'}</td>
                                        <td><strong>{item.name}</strong></td>
                                        <td>
                                            <span className={`badge ${item.action === 'created' ? 'badge-success' : 'badge-primary'}`}>
                                                {item.action === 'created' ? i18n.t('static.bulk.created') : i18n.t('static.bulk.edited')}
                                            </span>
                                        </td>
                                        <td>
                                            <ul className="mb-0 pl-3">
                                                {item.changes.map((chg, chgIdx) => (
                                                    <li key={chgIdx}>
                                                        <strong>{chg.field}:</strong>{' '}
                                                        {chg.oldVal !== undefined && (
                                                            <span>
                                                                <del className="text-muted">{chg.oldVal || '(empty)'}</del>{' '}
                                                                &rarr;{' '}
                                                            </span>
                                                        )}
                                                        <span className="text-success">{chg.newVal || '(empty)'}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            type="button"
                            size="md"
                            color="danger"
                            className="float-right mr-1"
                            onClick={this.toggleReviewModal}
                        >
                            <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}
                        </Button>
                        <Button
                            type="button"
                            size="md"
                            color="success"
                            className="float-right mr-1"
                            onClick={this.confirmUpdate}
                        >
                            <i className="fa fa-check"></i> {i18n.t('static.report.ok')}
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

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
import DropdownService from '../../api/DropdownService';
import PlanningUnitService from '../../api/PlanningUnitService';
import RealmService from '../../api/RealmService';
import UnitService from '../../api/UnitService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import { jExcelLoadedFunction, onOpenFilter } from '../../CommonComponent/JExcelCommonFunctions';

const entityname = i18n.t('static.planningunit.planningunit');

export default class BulkPlanningUnitComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            realmId: '',
            units: [],
            unitList: [],
            forecastingUnits: [],
            planningUnitList: [],
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
            DropdownService.getForecastingUnitDropDownList(),
            PlanningUnitService.getPlanningUnitByRealmId(realmId)
        ])
            .then(([unitRes, fuRes, puRes]) => {
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

                let fus = (fuRes.status === 'fulfilled' && fuRes.value.data) ? fuRes.value.data : [];
                fus.sort((a, b) => {
                    let labelA = a && a.payload ? a.payload.label : (a && a.label);
                    let labelB = b && b.payload ? b.payload.label : (b && b.label);
                    var la = (getLabelText(labelA, this.state.lang) || '').toUpperCase();
                    var lb = (getLabelText(labelB, this.state.lang) || '').toUpperCase();
                    return la > lb ? 1 : -1;
                });
                let forecastingUnits = fus.map(item => {
                    let p = item.payload || item;
                    let fuId = p.forecastingUnitId !== undefined ? p.forecastingUnitId : p.id;
                    let fuName = getLabelText(p.label, this.state.lang) || p.name || '';
                    return {
                        id: fuId,
                        name: `${fuName} | ${fuId}`
                    };
                }).filter(c => c.id !== undefined && c.id !== null && c.name !== '');

                let planningUnits = [];
                if (puRes.status === 'fulfilled' && puRes.value.data) {
                    planningUnits = Array.isArray(puRes.value.data) ? puRes.value.data : [];
                } else if (puRes.status === 'rejected') {
                    if (puRes.reason && puRes.reason.response && puRes.reason.response.status === 404) {
                        planningUnits = [];
                    } else if (unitRes.status === 'rejected' || fuRes.status === 'rejected') {
                        this.handleError(puRes.reason || unitRes.reason || fuRes.reason);
                        return;
                    } else {
                        planningUnits = [];
                    }
                }

                planningUnits.sort((a, b) => {
                    var la = (getLabelText(a && a.label, this.state.lang) || '').toUpperCase();
                    var lb = (getLabelText(b && b.label, this.state.lang) || '').toUpperCase();
                    return la > lb ? 1 : -1;
                });

                this.changedRows = new Set();
                this.setState({
                    units: unitList,
                    forecastingUnits: forecastingUnits,
                    planningUnitList: planningUnits,
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
        let container = document.getElementById("planningUnitTableDiv");
        if (container) {
            jexcel.destroy(container, true);
        }

        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        let data = [];
        let { planningUnitList, forecastingUnits, units } = this.state;
        for (let i = 0; i < planningUnitList.length; i++) {
            let pu = planningUnitList[i];
            let puName = pu.label ? (pu.label.label_en || getLabelText(pu.label, this.state.lang) || '') : '';
            let fuId = pu.forecastingUnit ? (pu.forecastingUnit.forecastingUnitId !== undefined ? pu.forecastingUnit.forecastingUnitId : pu.forecastingUnit.id) : '';
            let uId = pu.unit ? (pu.unit.id !== undefined ? pu.unit.id : pu.unit.unitId) : '';
            // Row follows manual entry order:
            // 0: ID, 1: Associated FU, 2: Multiplier, 3: Product Name, 4: Unit of Measure, 5: Status, 6: isChanged
            let row = [
                pu.planningUnitId,
                fuId !== undefined && fuId !== null ? fuId : '',
                pu.multiplier,
                puName,
                uId !== undefined && uId !== null ? uId : '',
                pu.active ? '1' : '0',
                0 // isChanged: 0
            ];
            data.push(row);
        }

        let options = {
            data: data,
            columnDrag: false,
            columns: [
                { title: i18n.t('static.dataEntry.planningUnitId'), type: 'text', readOnly: true, width: 100 },
                { title: `${i18n.t('static.planningUnit.associatedForecastingUnit')} *`, type: 'dropdown', source: forecastingUnits, width: 340, autocomplete: true },
                { title: `${i18n.t('static.planningUnit.labelMultiplier')} *`, type: 'numeric', width: 130, mask: '#,##0.00', decimal: '.' },
                { title: `${i18n.t('static.product.productName')} *`, type: 'text', width: 280 },
                { title: `${i18n.t('static.planningUnit.planningUnitOfMeasure')} *`, type: 'dropdown', source: units, width: 180, autocomplete: true },
                { title: i18n.t('static.common.status'), type: 'dropdown', source: [{ id: '1', name: i18n.t('static.common.active') }, { id: '0', name: i18n.t('static.common.disabled') }], width: 110 },
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
                            title: i18n.t('static.program.viewProgramsUsingEntity', { entityname: i18n.t('static.planningunit.planningunit') }),
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
                            instance.insertRow([0, '', 1, '', '', '1', 1]);
                        }
                    }
                }
                return data;
            }.bind(this),
            onpaste: this.onPaste,
            onload: function (instance) {
                jExcelLoadedFunction(instance);
                let filter = document.querySelector('#planningUnitTableDiv .jss_pagination .order-1');
                if (filter) {
                    filter.classList.add('mr-2');
                }
                this.loadingTable = false;
            }.bind(this)
        };

        this.loadingTable = true;
        this.el = jexcel(document.getElementById("planningUnitTableDiv"), options);
    }

    changed(instance, cell, x, y, value) {
        if (this.loadingTable) return;
        if (x !== 6) {
            this.changedRows.add(parseInt(y));
            this.el.setValueFromCoords(6, y, 1, true);
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
                    this.el.setValueFromCoords(6, y, 1, true);
                    this.changedRows.add(y);
                }
                // Col 1: Associated FU
                let fuVal = json[y][1];
                if (fuVal && isNaN(parseInt(fuVal))) {
                    let found = this.state.forecastingUnits.find(f => f.name.toLowerCase() === String(fuVal).trim().toLowerCase());
                    if (found) {
                        this.el.setValueFromCoords(1, y, found.id, true);
                    }
                }
                // Col 4: Planning Unit of Measure
                let uVal = json[y][4];
                if (uVal && isNaN(parseInt(uVal))) {
                    let found = this.state.units.find(u => u.name.toLowerCase() === String(uVal).trim().toLowerCase());
                    if (found) {
                        this.el.setValueFromCoords(4, y, found.id, true);
                    }
                }
                // Col 5: Status
                let stVal = json[y][5];
                if (stVal !== undefined && stVal !== null && stVal !== '') {
                    let stLower = String(stVal).toLowerCase();
                    if (stLower === 'active' || stLower === '1') {
                        this.el.setValueFromCoords(5, y, '1', true);
                    } else if (stLower === 'disabled' || stLower === 'inactive' || stLower === '0') {
                        this.el.setValueFromCoords(5, y, '0', true);
                    }
                } else {
                    this.el.setValueFromCoords(5, y, '1', true);
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
                '',  // 1: Associated FU
                1,   // 2: Multiplier
                '',  // 3: Product Name
                '',  // 4: Unit of Measure
                '1', // 5: Status
                1    // 6: isChanged
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
        let sheetName = i18n.t('static.planningUnit.bulkEdit').replace(/[*?:\\/[\]]/g, ' ').substring(0, 31).trim();
        let worksheet = workbook.addWorksheet(sheetName);

        let lookupSheet = workbook.addWorksheet('LookupData');
        lookupSheet.state = 'hidden';

        let fuList = this.state.forecastingUnits.map(f => f.name).filter(Boolean);
        let uList = this.state.units.map(u => u.name).filter(Boolean);

        lookupSheet.columns = [
            { header: 'Forecasting Units', key: 'fu', width: 40 },
            { header: 'Units', key: 'unit', width: 25 }
        ];

        let maxRows = Math.max(fuList.length, uList.length);
        for (let r = 0; r < maxRows; r++) {
            lookupSheet.addRow([
                fuList[r] || '',
                uList[r] || ''
            ]);
        }

        // Ordered exactly as manual entry screen, NO ID, NO Status
        worksheet.columns = [
            { header: i18n.t('static.planningUnit.associatedForecastingUnit') + ' *', key: 'fu', width: 35 },
            { header: i18n.t('static.planningUnit.labelMultiplier') + ' *', key: 'multiplier', width: 18 },
            { header: i18n.t('static.product.productName') + ' *', key: 'name', width: 35 },
            { header: i18n.t('static.planningUnit.planningUnitOfMeasure') + ' *', key: 'unit', width: 25 }
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
        if (fuList.length > 0) {
            worksheet.dataValidations.add('A2:A2000', {
                type: 'list',
                allowBlank: true,
                formulae: [`LookupData!$A$2:$A$${fuList.length + 1}`],
                showErrorMessage: true
            });
        }

        if (uList.length > 0) {
            worksheet.dataValidations.add('D2:D2000', {
                type: 'list',
                allowBlank: true,
                formulae: [`LookupData!$B$2:$B$${uList.length + 1}`],
                showErrorMessage: true
            });
        }

        let sampleFu = fuList.length > 0 ? fuList[0] : 'Sample Forecasting Unit | 1';
        let sampleU = uList.length > 0 ? uList[0] : 'Sample Unit';
        worksheet.addRow([sampleFu, 1, 'Example Planning Unit Name', sampleU]);

        workbook.xlsx.writeBuffer().then(data => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `${i18n.t('static.planningUnit.bulkEdit')}_Template.xlsx`);
        });
    }

    openProgramsModal(puId, puName) {
        this.setState({
            programsModal: true,
            programsLoading: true,
            selectedEntityName: puName || '',
            programList: []
        });
        PlanningUnitService.getPlanningUnitByIdWithPrograms(puId)
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
            let puId = row[0] ? parseInt(row[0]) : 0;
            let isRowChanged = this.changedRows.has(y) || puId === 0 || row[6] === 1 || row[6] === '1' || parseInt(this.el.getValueFromCoords(6, y)) === 1;

            let fuId = row[1];
            if (fuId && isNaN(parseInt(fuId))) {
                let found = this.state.forecastingUnits.find(f => f.name.toLowerCase() === String(fuId).trim().toLowerCase());
                if (found) fuId = found.id;
            }
            let multVal = row[2];
            let multStr = (multVal !== undefined && multVal !== null) ? multVal.toString().replaceAll(",", "").trim() : '';
            let puName = row[3] ? row[3].toString().trim() : '';
            let unitId = row[4];
            if (unitId && isNaN(parseInt(unitId))) {
                let found = this.state.units.find(u => u.name.toLowerCase() === String(unitId).trim().toLowerCase());
                if (found) unitId = found.id;
            }

            // Ignore completely blank new rows
            let isCompletelyEmpty = (!fuId || fuId === '') && (puName === '') && (!unitId || unitId === '');
            if (puId === 0 && isCompletelyEmpty) {
                continue;
            }

            if (!isRowChanged) {
                let existingName = puName.toLowerCase();
                if (existingName !== '') {
                    seenNames.set(existingName, y);
                }
                continue;
            }

            let identifier = puId > 0
                ? `${i18n.t('static.bulk.id')}: ${puId}`
                : (puName !== '' ? `${i18n.t('static.bulk.name')}: "${puName}"` : `${i18n.t('static.bulk.row')}: ${y + 1}`);

            // Clear previous styles for this row (Cols 1 to 4)
            for (let c = 1; c <= 4; c++) {
                let cellCoord = colLetters[c] + (y + 1);
                this.el.setStyle(cellCoord, "background-color", "transparent");
                this.el.setComments(cellCoord, "");
            }

            // Col 1: Associated Forecasting Unit required
            if (fuId === '' || fuId === null || fuId === undefined) {
                let cellCoord = "B" + (y + 1);
                this.el.setStyle(cellCoord, "background-color", "yellow");
                this.el.setComments(cellCoord, i18n.t('static.label.fieldRequired'));
                errors.push({
                    page: pageNum,
                    row: y + 1,
                    identifier: identifier,
                    field: i18n.t('static.planningUnit.associatedForecastingUnit'),
                    message: i18n.t('static.label.fieldRequired'),
                    coord: cellCoord
                });
                valid = false;
            }

            // Col 2: Multiplier required and > 0
            if (multStr === '') {
                let cellCoord = "C" + (y + 1);
                this.el.setStyle(cellCoord, "background-color", "yellow");
                this.el.setComments(cellCoord, i18n.t('static.label.fieldRequired'));
                errors.push({
                    page: pageNum,
                    row: y + 1,
                    identifier: identifier,
                    field: i18n.t('static.planningUnit.labelMultiplier'),
                    message: i18n.t('static.label.fieldRequired'),
                    coord: cellCoord
                });
                valid = false;
            } else if (isNaN(Number(multStr)) || Number(multStr) <= 0) {
                let cellCoord = "C" + (y + 1);
                this.el.setStyle(cellCoord, "background-color", "yellow");
                this.el.setComments(cellCoord, i18n.t('static.program.validvaluetext'));
                errors.push({
                    page: pageNum,
                    row: y + 1,
                    identifier: identifier,
                    field: i18n.t('static.planningUnit.labelMultiplier'),
                    message: i18n.t('static.program.validvaluetext'),
                    coord: cellCoord
                });
                valid = false;
            }

            // Col 3: Product Name required and unique
            if (puName === '') {
                let cellCoord = "D" + (y + 1);
                this.el.setStyle(cellCoord, "background-color", "yellow");
                this.el.setComments(cellCoord, i18n.t('static.label.fieldRequired'));
                errors.push({
                    page: pageNum,
                    row: y + 1,
                    identifier: identifier,
                    field: i18n.t('static.product.productName'),
                    message: i18n.t('static.label.fieldRequired'),
                    coord: cellCoord
                });
                valid = false;
            } else {
                let lowerName = puName.toLowerCase();
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
                        field: i18n.t('static.product.productName'),
                        message: dupMsg,
                        coord: cellCoord
                    });
                    valid = false;
                } else {
                    seenNames.set(lowerName, y);
                }
            }

            // Col 4: Unit of Measure required
            if (unitId === '' || unitId === null || unitId === undefined) {
                let cellCoord = "E" + (y + 1);
                this.el.setStyle(cellCoord, "background-color", "yellow");
                this.el.setComments(cellCoord, i18n.t('static.label.fieldRequired'));
                errors.push({
                    page: pageNum,
                    row: y + 1,
                    identifier: identifier,
                    field: i18n.t('static.planningUnit.planningUnitOfMeasure'),
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

        for (let y = 0; y < json.length; y++) {
            let row = json[y];
            let puId = row[0] ? parseInt(row[0]) : 0;
            let isRowChanged = this.changedRows.has(y) || puId === 0 || row[6] === 1 || row[6] === '1' || parseInt(this.el.getValueFromCoords(6, y)) === 1;

            let fuId = parseInt(row[1]);
            if (isNaN(fuId) && row[1]) {
                let found = this.state.forecastingUnits.find(f => f.name.toLowerCase() === String(row[1]).trim().toLowerCase());
                if (found) fuId = found.id;
            }
            let multiplier = Number(row[2].toString().replaceAll(",", ""));
            let puName = row[3] ? row[3].toString().trim() : '';
            let uId = parseInt(row[4]);
            if (isNaN(uId) && row[4]) {
                let found = this.state.units.find(u => u.name.toLowerCase() === String(row[4]).trim().toLowerCase());
                if (found) uId = found.id;
            }
            let isActive = row[5] === 1 || row[5] === '1' || row[5] === true || row[5] === 'true' || String(row[5]).toLowerCase() === 'active';

            // Ignore completely blank new rows
            let isCompletelyEmpty = (isNaN(fuId) || !fuId) && (puName === '') && (isNaN(uId) || !uId);
            if (puId === 0 && isCompletelyEmpty) {
                continue;
            }

            if (isRowChanged) {
                let fuObj = this.state.forecastingUnits.find(f => f.id === fuId);
                let fuName = fuObj ? fuObj.name : fuId;
                let uObj = this.state.units.find(u => u.id === uId);
                let uName = uObj ? uObj.name : uId;
                let statusName = isActive ? i18n.t('static.common.active') : i18n.t('static.dataentry.inactive');

                let changes = [];
                let isNew = puId === 0;

                if (isNew) {
                    changes.push({ field: i18n.t('static.planningUnit.associatedForecastingUnit'), newVal: fuName });
                    changes.push({ field: i18n.t('static.planningUnit.labelMultiplier'), newVal: multiplier });
                    changes.push({ field: i18n.t('static.product.productName'), newVal: puName });
                    changes.push({ field: i18n.t('static.planningUnit.planningUnitOfMeasure'), newVal: uName });
                    changes.push({ field: i18n.t('static.common.status'), newVal: statusName });
                } else {
                    let orig = this.state.planningUnitList.find(p => p.planningUnitId === puId);
                    if (orig) {
                        let origFuId = orig.forecastingUnit ? (orig.forecastingUnit.forecastingUnitId !== undefined ? orig.forecastingUnit.forecastingUnitId : orig.forecastingUnit.id) : '';
                        let origUId = orig.unit ? (orig.unit.id !== undefined ? orig.unit.id : orig.unit.unitId) : '';
                        let origMult = orig.multiplier;
                        let origPuName = orig.label ? (orig.label.label_en || getLabelText(orig.label, this.state.lang) || '') : '';
                        let origActive = !!orig.active;

                        if (parseInt(origFuId) !== parseInt(fuId)) {
                            let oldFuObj = this.state.forecastingUnits.find(f => f.id === origFuId);
                            changes.push({ field: i18n.t('static.planningUnit.associatedForecastingUnit'), oldVal: oldFuObj ? oldFuObj.name : origFuId, newVal: fuName });
                        }
                        if (Number(origMult) !== Number(multiplier)) {
                            changes.push({ field: i18n.t('static.planningUnit.labelMultiplier'), oldVal: origMult, newVal: multiplier });
                        }
                        if (origPuName.trim() !== puName.trim()) {
                            changes.push({ field: i18n.t('static.product.productName'), oldVal: origPuName, newVal: puName });
                        }
                        if (parseInt(origUId) !== parseInt(uId)) {
                            let oldUObj = this.state.units.find(u => u.id === origUId);
                            changes.push({ field: i18n.t('static.planningUnit.planningUnitOfMeasure'), oldVal: oldUObj ? oldUObj.name : origUId, newVal: uName });
                        }
                        if (origActive !== isActive) {
                            changes.push({ field: i18n.t('static.common.status'), oldVal: origActive ? i18n.t('static.common.active') : i18n.t('static.dataentry.inactive'), newVal: statusName });
                        }
                    }

                    // If existing unit has NO actual field changes, skip it!
                    if (changes.length === 0) {
                        this.changedRows.delete(y);
                        this.el.setValueFromCoords(6, y, 0, true);
                        continue;
                    }
                }

                let puObj = {
                    planningUnitId: puId,
                    forecastingUnit: {
                        forecastingUnitId: fuId
                    },
                    unit: {
                        unitId: uId
                    },
                    multiplier: multiplier,
                    label: {
                        label_en: puName
                    },
                    active: isActive
                };
                changedList.push(puObj);
                indexMap.push(y);

                submittedSummaryList.push({
                    id: puId,
                    name: puName || `(${i18n.t('static.bulk.newCreatedName')})`,
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
        PlanningUnitService.addPlanningUnitBulk(this.state.pendingChangedList)
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        isChanged: false,
                        message: 'static.message.updateSuccess',
                        color: 'green',
                        loading: false
                    }, () => {
                        this.props.history.push(`/planningUnit/listPlanningUnit/green/${this.state.message}`);
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
        this.props.history.push(`/planningUnit/listPlanningUnit`);
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
                            <div id="planningUnitTableDiv"></div>
                        </div>

                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "400px" }}>
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

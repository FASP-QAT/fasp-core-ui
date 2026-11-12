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
            submittedSummaryList: []
        };
        this.el = null;
        this.changedRows = new Set();
        this.buildJexcel = this.buildJexcel.bind(this);
        this.addRow = this.addRow.bind(this);
        this.changed = this.changed.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.confirmUpdate = this.confirmUpdate.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.exportTemplate = this.exportTemplate.bind(this);
        this.dataChangeForRealm = this.dataChangeForRealm.bind(this);
        this.toggleReviewModal = this.toggleReviewModal.bind(this);
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
                let forecastingUnitList = fus.map(item => {
                    let p = item.payload || item;
                    let fuId = p.forecastingUnitId !== undefined ? p.forecastingUnitId : p.id;
                    let fuName = p.label ? (getLabelText(p.label, this.state.lang) || p.label.label_en || '') : '';
                    let unitObj = p.unit;
                    let unitName = unitObj && unitObj.label ? (getLabelText(unitObj.label, this.state.lang) || unitObj.label.label_en || '') : '';
                    return {
                        id: fuId,
                        name: unitName ? `${fuName} - ${unitName}` : fuName
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
                    forecastingUnits: forecastingUnitList,
                    planningUnitList: planningUnits,
                    isChanged: false,
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

        let data = [];
        let { planningUnitList, forecastingUnits, units } = this.state;
        for (let i = 0; i < planningUnitList.length; i++) {
            let pu = planningUnitList[i];
            let puName = pu.label ? (pu.label.label_en || getLabelText(pu.label, this.state.lang) || '') : '';
            let fuId = pu.forecastingUnit ? (pu.forecastingUnit.forecastingUnitId !== undefined ? pu.forecastingUnit.forecastingUnitId : pu.forecastingUnit.id) : '';
            let uId = pu.unit ? (pu.unit.id !== undefined ? pu.unit.id : pu.unit.unitId) : '';
            let row = [
                pu.planningUnitId,
                fuId !== undefined && fuId !== null ? fuId : '',
                uId !== undefined && uId !== null ? uId : '',
                pu.multiplier,
                puName,
                pu.active ? '1' : '0',
                0 // isChanged: 0
            ];
            data.push(row);
        }

        let options = {
            data: data,
            columnDrag: false,
            columns: [
                { title: i18n.t('static.dataEntry.planningUnitId'), type: 'text', readOnly: true, width: 110 },
                { title: `${i18n.t('static.planningUnit.associatedForecastingUnit')} *`, type: 'dropdown', source: forecastingUnits, width: 320, autocomplete: true },
                { title: `${i18n.t('static.planningUnit.planningUnitOfMeasure')} *`, type: 'dropdown', source: units, width: 180, autocomplete: true },
                { title: `${i18n.t('static.planningUnit.labelMultiplier')} *`, type: 'numeric', width: 120, mask: '#,##0.00', decimal: '.' },
                { title: `${i18n.t('static.product.productName')} *`, type: 'text', width: 280 },
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
                        this.addRow();
                    }.bind(this)
                });
                if (y != null) {
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
            oneditionend: this.oneditionend,
            onpaste: this.onPaste,
            onload: jExcelLoadedFunction
        };

        this.el = jexcel(document.getElementById("planningUnitTableDiv"), options);
    }

    changed(instance, cell, x, y, value) {
        if (x !== 6) {
            this.changedRows.add(parseInt(y));
            this.el.setValueFromCoords(6, y, 1, true);
            if (!this.state.isChanged) {
                this.setState({ isChanged: true });
            }
        }
    }

    oneditionend(instance, cell, x, y, value) {
        if (x !== 6) {
            this.changedRows.add(parseInt(y));
            this.el.setValueFromCoords(6, y, 1, true);
            if (!this.state.isChanged) {
                this.setState({ isChanged: true });
            }
        }
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
                let fuVal = json[y][1];
                if (fuVal && isNaN(parseInt(fuVal))) {
                    let found = this.state.forecastingUnits.find(f => f.name.toLowerCase() === String(fuVal).trim().toLowerCase());
                    if (found) {
                        this.el.setValueFromCoords(1, y, found.id, true);
                    }
                }
                let uVal = json[y][2];
                if (uVal && isNaN(parseInt(uVal))) {
                    let found = this.state.units.find(u => u.name.toLowerCase() === String(uVal).trim().toLowerCase());
                    if (found) {
                        this.el.setValueFromCoords(2, y, found.id, true);
                    }
                }
                let stVal = json[y][5];
                if (stVal !== undefined && stVal !== null && stVal !== '') {
                    let stLower = String(stVal).toLowerCase();
                    if (stLower === 'active' || stLower === '1') {
                        this.el.setValueFromCoords(5, y, '1', true);
                    } else if (stLower === 'disabled' || stLower === 'inactive' || stLower === '0') {
                        this.el.setValueFromCoords(5, y, '0', true);
                    }
                }
            }
        }, 100);
    }

    addRow() {
        let row = [
            0,
            '',
            '',
            '',
            '',
            '1',
            1
        ];
        this.el.insertRow(row, 0, 1);
        let updatedSet = new Set();
        this.changedRows.forEach(idx => updatedSet.add(idx + 1));
        updatedSet.add(0);
        this.changedRows = updatedSet;
        this.setState({ isChanged: true });
    }

    exportTemplate() {
        let workbook = new Workbook();
        let sheetName = i18n.t('static.planningUnit.bulkEdit').replace(/[*?:\\/[\]]/g, ' ').substring(0, 31).trim();
        let worksheet = workbook.addWorksheet(sheetName);

        // Add hidden LookupData sheet for dropdown validation
        let lookupSheet = workbook.addWorksheet('LookupData');
        lookupSheet.state = 'hidden';

        let fuList = this.state.forecastingUnits.map(f => f.name).filter(Boolean);
        let uList = this.state.units.map(u => u.name).filter(Boolean);
        let statusList = ['Active', 'Disabled'];

        lookupSheet.columns = [
            { header: 'Forecasting Units', key: 'fu', width: 35 },
            { header: 'Units', key: 'unit', width: 25 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        let maxRows = Math.max(fuList.length, uList.length, statusList.length);
        for (let r = 0; r < maxRows; r++) {
            lookupSheet.addRow([
                fuList[r] || '',
                uList[r] || '',
                statusList[r] || ''
            ]);
        }

        worksheet.columns = [
            { header: i18n.t('static.dataEntry.planningUnitId') + ' (0 for new)', key: 'id', width: 22 },
            { header: i18n.t('static.planningUnit.associatedForecastingUnit') + ' *', key: 'fu', width: 35 },
            { header: i18n.t('static.planningUnit.planningUnitOfMeasure') + ' *', key: 'unit', width: 25 },
            { header: i18n.t('static.planningUnit.labelMultiplier') + ' *', key: 'multiplier', width: 18 },
            { header: i18n.t('static.product.productName') + ' *', key: 'name', width: 35 },
            { header: i18n.t('static.common.status') + ' (Active/Disabled)', key: 'status', width: 20 }
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

        // Add Data Validation dropdowns for rows 2 to 2000
        if (fuList.length > 0) {
            worksheet.dataValidations.add('B2:B2000', {
                type: 'list',
                allowBlank: true,
                formulae: [`LookupData!$A$2:$A$${fuList.length + 1}`],
                showErrorMessage: true
            });
        }

        if (uList.length > 0) {
            worksheet.dataValidations.add('C2:C2000', {
                type: 'list',
                allowBlank: true,
                formulae: [`LookupData!$B$2:$B$${uList.length + 1}`],
                showErrorMessage: true
            });
        }

        worksheet.dataValidations.add('F2:F2000', {
            type: 'list',
            allowBlank: true,
            formulae: [`LookupData!$C$2:$C$${statusList.length + 1}`],
            showErrorMessage: true
        });

        let sampleFu = fuList.length > 0 ? fuList[0] : 'Sample Forecasting Unit';
        let sampleU = uList.length > 0 ? uList[0] : 'Sample Unit';
        worksheet.addRow([0, sampleFu, sampleU, 30, 'Example Planning Unit 30s', 'Active']);

        workbook.xlsx.writeBuffer().then(data => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `${i18n.t('static.planningUnit.bulkEdit')}_Template.xlsx`);
        });
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
        let colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

        for (let y = 0; y < json.length; y++) {
            let row = json[y];
            let pageNum = Math.floor(y / pageSize) + 1;
            let puId = row[0] ? parseInt(row[0]) : 0;
            let isRowChanged = this.changedRows.has(y) || puId === 0 || row[6] === 1 || row[6] === '1' || parseInt(this.el.getValueFromCoords(6, y)) === 1;

            if (!isRowChanged) {
                let existingName = row[4] ? row[4].toString().trim().toLowerCase() : '';
                if (existingName !== '') {
                    seenNames.set(existingName, y);
                }
                continue;
            }

            let fuId = row[1];
            if (fuId && isNaN(parseInt(fuId))) {
                let found = this.state.forecastingUnits.find(f => f.name.toLowerCase() === String(fuId).trim().toLowerCase());
                if (found) fuId = found.id;
            }
            let unitId = row[2];
            if (unitId && isNaN(parseInt(unitId))) {
                let found = this.state.units.find(u => u.name.toLowerCase() === String(unitId).trim().toLowerCase());
                if (found) unitId = found.id;
            }
            let multiplier = row[3];
            let puName = row[4] ? row[4].toString().trim() : '';

            let identifier = puId > 0
                ? `${i18n.t('static.bulk.id')}: ${puId}`
                : (puName !== '' ? `${i18n.t('static.bulk.name')}: "${puName}"` : `${i18n.t('static.bulk.row')}: ${y + 1}`);

            // Clear previous styles for this row
            for (let c = 1; c <= 4; c++) {
                let cellCoord = colLetters[c] + (y + 1);
                this.el.setStyle(cellCoord, "background-color", "transparent");
                this.el.setComments(cellCoord, "");
            }

            // Col 1: Forecasting Unit required
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

            // Col 2: Unit required
            if (unitId === '' || unitId === null || unitId === undefined) {
                let cellCoord = "C" + (y + 1);
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

            // Col 3: Multiplier required and > 0
            let multStr = (multiplier !== null && multiplier !== undefined) ? multiplier.toString().replaceAll(",", "") : "";
            if (multStr === "") {
                let cellCoord = "D" + (y + 1);
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
                let cellCoord = "D" + (y + 1);
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

            // Col 4: Planning Unit Name required and unique
            if (puName === '') {
                let cellCoord = "E" + (y + 1);
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
                    let cellCoord = "E" + (y + 1);
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

            if (isRowChanged) {
                let fuId = parseInt(row[1]);
                if (isNaN(fuId) && row[1]) {
                    let found = this.state.forecastingUnits.find(f => f.name.toLowerCase() === String(row[1]).trim().toLowerCase());
                    if (found) fuId = found.id;
                }
                let uId = parseInt(row[2]);
                if (isNaN(uId) && row[2]) {
                    let found = this.state.units.find(u => u.name.toLowerCase() === String(row[2]).trim().toLowerCase());
                    if (found) uId = found.id;
                }
                let multiplier = Number(row[3].toString().replaceAll(",", ""));
                let puName = row[4] ? row[4].toString().trim() : '';
                let isActive = row[5] === 1 || row[5] === '1' || row[5] === true || row[5] === 'true' || String(row[5]).toLowerCase() === 'active';

                let puObj = {
                    planningUnitId: puId,
                    forecastingUnit: {
                        forecastingUnitId: fuId
                    },
                    unit: {
                        id: uId
                    },
                    multiplier: multiplier,
                    label: {
                        label_en: puName
                    },
                    active: isActive
                };
                changedList.push(puObj);
                indexMap.push(y);

                let fuObj = this.state.forecastingUnits.find(f => f.id === fuId);
                let fuName = fuObj ? fuObj.name : fuId;
                let uObj = this.state.units.find(u => u.id === uId);
                let uName = uObj ? uObj.name : uId;
                let statusName = isActive ? i18n.t('static.common.active') : i18n.t('static.common.disabled');

                let changes = [];
                let isNew = puId === 0;

                if (isNew) {
                    changes.push({ field: i18n.t('static.planningUnit.associatedForecastingUnit'), newVal: fuName });
                    changes.push({ field: i18n.t('static.planningUnit.planningUnitOfMeasure'), newVal: uName });
                    changes.push({ field: i18n.t('static.planningUnit.labelMultiplier'), newVal: multiplier });
                    changes.push({ field: i18n.t('static.common.status'), newVal: statusName });
                } else {
                    let orig = this.state.planningUnitList.find(p => p.planningUnitId === puId);
                    if (orig) {
                        let origPuName = orig.label ? (orig.label.label_en || getLabelText(orig.label, this.state.lang) || '') : '';
                        let origFuId = orig.forecastingUnit ? (orig.forecastingUnit.forecastingUnitId !== undefined ? orig.forecastingUnit.forecastingUnitId : orig.forecastingUnit.id) : '';
                        let origUId = orig.unit ? (orig.unit.id !== undefined ? orig.unit.id : orig.unit.unitId) : '';
                        let origMultiplier = orig.multiplier !== undefined && orig.multiplier !== null ? parseFloat(orig.multiplier) : null;
                        let origActive = !!orig.active;

                        if (origPuName !== puName) {
                            changes.push({ field: i18n.t('static.product.productName'), oldVal: origPuName, newVal: puName });
                        }
                        if (parseInt(origFuId) !== fuId) {
                            let oldFuObj = this.state.forecastingUnits.find(f => f.id === parseInt(origFuId));
                            changes.push({ field: i18n.t('static.planningUnit.associatedForecastingUnit'), oldVal: oldFuObj ? oldFuObj.name : origFuId, newVal: fuName });
                        }
                        if (parseInt(origUId) !== uId) {
                            let oldUObj = this.state.units.find(u => u.id === parseInt(origUId));
                            changes.push({ field: i18n.t('static.planningUnit.planningUnitOfMeasure'), oldVal: oldUObj ? oldUObj.name : origUId, newVal: uName });
                        }
                        if (origMultiplier !== multiplier) {
                            changes.push({ field: i18n.t('static.planningUnit.labelMultiplier'), oldVal: orig.multiplier, newVal: multiplier });
                        }
                        if (origActive !== isActive) {
                            changes.push({
                                field: i18n.t('static.common.status'),
                                oldVal: origActive ? i18n.t('static.common.active') : i18n.t('static.common.disabled'),
                                newVal: statusName
                            });
                        }
                    }
                    if (changes.length === 0) {
                        changes.push({ field: i18n.t('static.common.status'), newVal: statusName });
                    }
                }

                submittedSummaryList.push({
                    id: puId,
                    name: puName,
                    isNew: isNew,
                    changes: changes
                });
            }
        }

        if (changedList.length === 0) {
            this.setState({
                message: 'static.bulk.noChanges',
                color: 'red'
            });
            hideSecondComponent();
            return;
        }

        let totalCreated = changedList.filter(item => item.planningUnitId === 0).length;
        let totalEdited = changedList.length - totalCreated;

        this.setState({
            pendingChangedList: changedList,
            pendingIndexMap: indexMap,
            submittedSummaryList: submittedSummaryList,
            totalCreated: totalCreated,
            totalEdited: totalEdited,
            reviewModal: true,
            validationErrors: []
        });
    }

    confirmUpdate() {
        let { pendingChangedList, pendingIndexMap } = this.state;
        if (!pendingChangedList || pendingChangedList.length === 0) {
            this.setState({ reviewModal: false });
            return;
        }

        this.setState({ loading: true });
        PlanningUnitService.addPlanningUnitBulk(pendingChangedList)
            .then(response => {
                if (response.status === 200) {
                    let result = response.data;
                    let savedUnits = result.savedUnits || [];
                    let updatedPuList = [...this.state.planningUnitList];

                    for (let k = 0; k < savedUnits.length; k++) {
                        let rowIndex = pendingIndexMap[k];
                        let unit = savedUnits[k];
                        // Update planningUnitId in col 0
                        this.el.setValueFromCoords(0, rowIndex, unit.planningUnitId, true);
                        // Reset isChanged in col 6
                        this.el.setValueFromCoords(6, rowIndex, 0, true);
                        let existingIdx = updatedPuList.findIndex(p => p.planningUnitId === unit.planningUnitId);
                        if (existingIdx !== -1) {
                            updatedPuList[existingIdx] = unit;
                        } else {
                            updatedPuList.push(unit);
                        }
                    }

                    this.changedRows = new Set();
                    this.setState({
                        loading: false,
                        isChanged: false,
                        reviewModal: false,
                        pendingChangedList: [],
                        pendingIndexMap: [],
                        submittedSummaryList: [],
                        planningUnitList: updatedPuList,
                        validationErrors: [],
                        message: 'static.message.updateSuccess',
                        color: 'green'
                    });
                    hideSecondComponent();
                } else {
                    this.setState({
                        loading: false,
                        message: response.data.messageCode || 'static.unkownError',
                        color: 'red'
                    });
                    hideSecondComponent();
                }
            })
            .catch(error => {
                this.setState({ loading: false, reviewModal: false });
                this.handleError(error);
            });
    }

    toggleReviewModal() {
        if (!this.state.loading) {
            this.setState({ reviewModal: !this.state.reviewModal });
        }
    }

    handleError(error) {
        let msg = 'static.unkownError';
        if (error.message === "Network Error") {
            msg = API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage"));
        } else if (error.response) {
            switch (error.response.status) {
                case 401:
                    this.props.history.push(`/login/static.message.sessionExpired`);
                    return;
                case 403:
                    this.props.history.push(`/accessDenied`);
                    return;
                case 406:
                    msg = error.response.data && error.response.data.messageCode ? error.response.data.messageCode : 'static.message.planningUnitAlreadyExists';
                    break;
                default:
                    msg = error.response.data && error.response.data.messageCode ? error.response.data.messageCode : 'static.unkownError';
                    break;
            }
        }
        this.setState({
            message: msg,
            loading: false,
            color: 'red'
        });
        hideSecondComponent();
    }

    cancelClicked() {
        this.props.history.push('/planningUnit/listPlanningUnit');
    }

    render() {
        const { realms, realmId, validationErrors } = this.state;
        let realmList = realms.length > 0 && realms.map((item, i) => (
            <option key={i} value={item.realmId}>
                {getLabelText(item.label, this.state.lang)}
            </option>
        ));

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{this.props.match.params.message ? i18n.t(this.props.match.params.message, { entityname }) : ''}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>

                {validationErrors.length > 0 && (
                    <Alert color="danger" className="mb-3">
                        <h6 className="font-weight-bold">
                            <i className="fa fa-exclamation-triangle mr-2"></i>
                            {i18n.t('static.bulk.validationErrors')} ({validationErrors.length})
                        </h6>
                        <ul className="mb-0 pl-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {validationErrors.map((err, idx) => (
                                <li key={idx} className="mb-1">
                                    <span className="font-weight-bold">[{i18n.t('static.bulk.page')} {err.page}, {i18n.t('static.bulk.row')} {err.row}]</span>
                                    {' '}<span>{err.identifier}</span> - <span>{err.field}</span>: <span className="text-dark">{err.message}</span>
                                    <Button
                                        color="link"
                                        size="sm"
                                        className="p-0 ml-2 text-danger font-weight-bold"
                                        onClick={() => this.goToError(err)}
                                    >
                                        <i className="fa fa-arrow-circle-right mr-1"></i>{i18n.t('static.bulk.goToPage')} {err.page}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </Alert>
                )}

                <Card>
                    <CardBody className="pb-lg-2 pt-lg-2">
                        <Row className="mb-3">
                            <Col md="4" id="realmDiv" style={{ display: AuthenticationService.getRealmId() === -1 ? 'block' : 'none' }}>
                                <FormGroup>
                                    <Label htmlFor="realmId">{i18n.t('static.realm.realm')}</Label>
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
                                </FormGroup>
                            </Col>
                            <Col md="8" className="d-flex align-items-center justify-content-end ml-auto">
                                <Button
                                    color="info"
                                    size="md"
                                    className="float-right mr-1"
                                    onClick={this.exportTemplate}
                                    title={i18n.t('static.dataentry.downloadTemplate')}
                                >
                                    <i className="fa fa-download mr-1"></i>{i18n.t('static.dataentry.downloadTemplate')}
                                </Button>
                            </Col>
                        </Row>

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
                                color="danger"
                                className="mr-1 float-right"
                                size="md"
                                onClick={this.cancelClicked}
                                disabled={this.state.loading}
                            >
                                <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}
                            </Button>
                            {this.state.isChanged && (
                                <Button
                                    type="button"
                                    color="success"
                                    className="mr-1 float-right"
                                    size="md"
                                    onClick={this.formSubmit}
                                >
                                    <i className="fa fa-check"></i> {i18n.t('static.common.submit')}
                                </Button>
                            )}
                            <Button
                                color="info"
                                size="md"
                                className="float-right mr-1"
                                type="button"
                                onClick={this.addRow}
                                disabled={this.state.loading}
                            >
                                <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}
                            </Button>
                        </FormGroup>
                    </CardFooter>
                </Card>

                {/* Review Changes Modal */}
                <Modal isOpen={this.state.reviewModal} toggle={this.toggleReviewModal} className="modal-lg">
                    <ModalHeader toggle={this.toggleReviewModal} className="bg-primary text-white">
                        <i className="fa fa-list-alt mr-2"></i>{i18n.t('static.bulk.reviewChanges')}
                    </ModalHeader>
                    <ModalBody>
                        <div className="p-2">
                            <p className="mb-3 text-muted" style={{ fontSize: '14px' }}>
                                <i className="fa fa-info-circle mr-2 text-primary"></i>
                                {i18n.t('static.bulk.reviewPrompt')}
                            </p>
                            <div className="d-flex mb-3">
                                <div className="mr-3">
                                    <span className="badge badge-primary p-2" style={{ fontSize: '13px' }}>
                                        {i18n.t('static.bulk.unitsEdited')}: <strong>{this.state.totalEdited}</strong>
                                    </span>
                                </div>
                                <div>
                                    <span className="badge badge-success p-2" style={{ fontSize: '13px' }}>
                                        {i18n.t('static.bulk.unitsCreated')}: <strong>{this.state.totalCreated}</strong>
                                    </span>
                                </div>
                            </div>

                            {this.state.submittedSummaryList && this.state.submittedSummaryList.length > 0 && (
                                <div className="table-responsive" style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid #dee2e6' }}>
                                    <Table hover size="sm" className="mb-0">
                                        <thead className="thead-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                            <tr>
                                                <th style={{ width: '15%' }}>{i18n.t('static.bulk.action')}</th>
                                                <th style={{ width: '35%' }}>{i18n.t('static.bulk.name')}</th>
                                                <th style={{ width: '50%' }}>{i18n.t('static.bulk.changes')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.submittedSummaryList.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="align-middle">
                                                        {item.isNew ? (
                                                            <span className="badge badge-success">{i18n.t('static.bulk.created')}</span>
                                                        ) : (
                                                            <span className="badge badge-primary">{i18n.t('static.bulk.edited')}</span>
                                                        )}
                                                    </td>
                                                    <td className="align-middle font-weight-bold">
                                                        {item.name}
                                                        {item.id > 0 && <small className="text-muted d-block">ID: {item.id}</small>}
                                                    </td>
                                                    <td className="align-middle">
                                                        {item.changes && item.changes.length > 0 ? (
                                                            <ul className="list-unstyled mb-0" style={{ fontSize: '12px' }}>
                                                                {item.changes.map((ch, cIdx) => (
                                                                    <li key={cIdx}>
                                                                        <strong>{ch.field}:</strong>{' '}
                                                                        {ch.oldVal !== undefined ? (
                                                                            <>
                                                                                <span className="text-danger"><del>{ch.oldVal}</del></span>
                                                                                {' → '}
                                                                                <span className="text-success font-weight-bold">{ch.newVal}</span>
                                                                            </>
                                                                        ) : (
                                                                            <span>{ch.newVal}</span>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <span className="text-muted" style={{ fontSize: '12px' }}>-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggleReviewModal} disabled={this.state.loading}>
                            <i className="fa fa-times mr-1"></i> {i18n.t('static.common.cancel')}
                        </Button>
                        <Button color="success" onClick={this.confirmUpdate} disabled={this.state.loading}>
                            {this.state.loading ? (
                                <>
                                    <i className="fa fa-spinner fa-spin mr-1"></i>
                                    {i18n.t('static.common.loading')}
                                </>
                            ) : (
                                <>
                                    <i className="fa fa-check mr-1"></i>
                                    {i18n.t('static.common.ok')}
                                </>
                            )}
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}


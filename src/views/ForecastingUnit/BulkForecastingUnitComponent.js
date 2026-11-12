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
            ProductCategoryService.getProductCategoryListByRealmId(realmId),
            TracerCategoryService.getTracerCategoryByRealmId(realmId),
            ForecastingUnitService.getForcastingUnitByRealmId(realmId)
        ])
            .then(([unitRes, pcRes, tcRes, fuRes]) => {
                console.log("BulkForecastingUnit dependencies loaded:", { unitRes, pcRes, tcRes, fuRes });
                if (fuRes.status === 'rejected') {
                    console.error("fuRes rejected:", fuRes.reason);
                }
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

                // Handle 404/Empty result gracefully (empty array when no FUs exist for this realm)
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
        let container = document.getElementById("forecastingUnitTableDiv");
        if (container) {
            jexcel.destroy(container, true);
        }

        let data = [];
        let { forecastingUnitList } = this.state;
        for (let i = 0; i < forecastingUnitList.length; i++) {
            let fu = forecastingUnitList[i];
            let genericName = fu.genericLabel ? (fu.genericLabel.label_en || getLabelText(fu.genericLabel, this.state.lang) || '') : '';
            let fuName = fu.label ? (fu.label.label_en || getLabelText(fu.label, this.state.lang) || '') : '';
            let pcId = fu.productCategory ? (fu.productCategory.id !== undefined ? fu.productCategory.id : fu.productCategory.productCategoryId) : '';
            let tcId = fu.tracerCategory ? (fu.tracerCategory.id !== undefined ? fu.tracerCategory.id : fu.tracerCategory.tracerCategoryId) : '';
            let uId = fu.unit ? (fu.unit.id !== undefined ? fu.unit.id : fu.unit.unitId) : '';
            let row = [
                fu.forecastingUnitId,
                pcId !== undefined && pcId !== null ? pcId : '',
                tcId !== undefined && tcId !== null ? tcId : '',
                uId !== undefined && uId !== null ? uId : '',
                genericName,
                fuName,
                fu.active ? '1' : '0',
                0 // isChanged: 0
            ];
            data.push(row);
        }

        let options = {
            data: data,
            columnDrag: false,
            columns: [
                { title: i18n.t('static.forecastingUnit.forecastingUnitId'), type: 'text', readOnly: true, width: 110 },
                { title: `${i18n.t('static.productcategory.productcategory')} *`, type: 'dropdown', source: this.state.productCategories, width: 220, autocomplete: true },
                { title: `${i18n.t('static.tracercategory.tracercategory')} *`, type: 'dropdown', source: this.state.tracerCategories, width: 220, autocomplete: true },
                { title: `${i18n.t('static.unit.unit')} *`, type: 'dropdown', source: this.state.units, width: 180, autocomplete: true },
                { title: i18n.t('static.product.productgenericname'), type: 'text', width: 240 },
                { title: `${i18n.t('static.forecastingunit.forecastingunit')} *`, type: 'text', width: 280 },
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

        this.el = jexcel(document.getElementById("forecastingUnitTableDiv"), options);
    }

    changed(instance, cell, x, y, value) {
        if (x !== 7) {
            this.changedRows.add(parseInt(y));
            this.el.setValueFromCoords(7, y, 1, true);
            if (!this.state.isChanged) {
                this.setState({ isChanged: true });
            }
        }
    }

    oneditionend(instance, cell, x, y, value) {
        if (x !== 7) {
            this.changedRows.add(parseInt(y));
            this.el.setValueFromCoords(7, y, 1, true);
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
                    this.el.setValueFromCoords(7, y, 1, true);
                    this.changedRows.add(y);
                }
                let pcVal = json[y][1];
                if (pcVal && isNaN(parseInt(pcVal))) {
                    let found = this.state.productCategories.find(pc => pc.name.toLowerCase() === String(pcVal).trim().toLowerCase());
                    if (found) {
                        this.el.setValueFromCoords(1, y, found.id, true);
                    }
                }
                let tcVal = json[y][2];
                if (tcVal && isNaN(parseInt(tcVal))) {
                    let found = this.state.tracerCategories.find(tc => tc.name.toLowerCase() === String(tcVal).trim().toLowerCase());
                    if (found) {
                        this.el.setValueFromCoords(2, y, found.id, true);
                    }
                }
                let uVal = json[y][3];
                if (uVal && isNaN(parseInt(uVal))) {
                    let found = this.state.units.find(u => u.name.toLowerCase() === String(uVal).trim().toLowerCase());
                    if (found) {
                        this.el.setValueFromCoords(3, y, found.id, true);
                    }
                }
                let stVal = json[y][6];
                if (stVal !== undefined && stVal !== null && stVal !== '') {
                    let stLower = String(stVal).toLowerCase();
                    if (stLower === 'active' || stLower === '1') {
                        this.el.setValueFromCoords(6, y, '1', true);
                    } else if (stLower === 'disabled' || stLower === 'inactive' || stLower === '0') {
                        this.el.setValueFromCoords(6, y, '0', true);
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
        let sheetName = i18n.t('static.forecastingUnit.bulkEdit').replace(/[*?:\\/[\]]/g, ' ').substring(0, 31).trim();
        let worksheet = workbook.addWorksheet(sheetName);

        // Add hidden LookupData sheet for dropdown validation
        let lookupSheet = workbook.addWorksheet('LookupData');
        lookupSheet.state = 'hidden';

        let pcList = this.state.productCategories.map(pc => pc.name).filter(Boolean);
        let tcList = this.state.tracerCategories.map(tc => tc.name).filter(Boolean);
        let uList = this.state.units.map(u => u.name).filter(Boolean);
        let statusList = ['Active', 'Disabled'];

        lookupSheet.columns = [
            { header: 'Product Categories', key: 'pc', width: 30 },
            { header: 'Tracer Categories', key: 'tc', width: 30 },
            { header: 'Units', key: 'unit', width: 25 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        let maxRows = Math.max(pcList.length, tcList.length, uList.length, statusList.length);
        for (let r = 0; r < maxRows; r++) {
            lookupSheet.addRow([
                pcList[r] || '',
                tcList[r] || '',
                uList[r] || '',
                statusList[r] || ''
            ]);
        }

        worksheet.columns = [
            { header: i18n.t('static.forecastingUnit.forecastingUnitId') + ' (0 for new)', key: 'id', width: 22 },
            { header: i18n.t('static.productcategory.productcategory') + ' *', key: 'pc', width: 30 },
            { header: i18n.t('static.tracercategory.tracercategory') + ' *', key: 'tc', width: 30 },
            { header: i18n.t('static.unit.unit') + ' *', key: 'unit', width: 25 },
            { header: i18n.t('static.product.productgenericname'), key: 'generic', width: 30 },
            { header: i18n.t('static.forecastingunit.forecastingunit') + ' *', key: 'name', width: 35 },
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
        if (pcList.length > 0) {
            worksheet.dataValidations.add('B2:B2000', {
                type: 'list',
                allowBlank: true,
                formulae: [`LookupData!$A$2:$A$${pcList.length + 1}`],
                showErrorMessage: true
            });
        }

        if (tcList.length > 0) {
            worksheet.dataValidations.add('C2:C2000', {
                type: 'list',
                allowBlank: true,
                formulae: [`LookupData!$B$2:$B$${tcList.length + 1}`],
                showErrorMessage: true
            });
        }

        if (uList.length > 0) {
            worksheet.dataValidations.add('D2:D2000', {
                type: 'list',
                allowBlank: true,
                formulae: [`LookupData!$C$2:$C$${uList.length + 1}`],
                showErrorMessage: true
            });
        }

        worksheet.dataValidations.add('G2:G2000', {
            type: 'list',
            allowBlank: true,
            formulae: [`LookupData!$D$2:$D$${statusList.length + 1}`],
            showErrorMessage: true
        });

        let samplePc = pcList.length > 0 ? pcList[0] : 'Sample Category';
        let sampleTc = tcList.length > 0 ? tcList[0] : 'Sample Tracer';
        let sampleU = uList.length > 0 ? uList[0] : 'Sample Unit';
        worksheet.addRow([0, samplePc, sampleTc, sampleU, 'Example Generic Name', 'Example Forecasting Unit Name', 'Active']);

        workbook.xlsx.writeBuffer().then(data => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `${i18n.t('static.forecastingUnit.bulkEdit')}_Template.xlsx`);
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
        let colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

        for (let y = 0; y < json.length; y++) {
            let row = json[y];
            let pageNum = Math.floor(y / pageSize) + 1;
            let fuId = row[0] ? parseInt(row[0]) : 0;
            let isRowChanged = this.changedRows.has(y) || fuId === 0 || row[7] === 1 || row[7] === '1' || parseInt(this.el.getValueFromCoords(7, y)) === 1;

            if (!isRowChanged) {
                let existingName = row[5] ? row[5].toString().trim().toLowerCase() : '';
                if (existingName !== '') {
                    seenNames.set(existingName, y);
                }
                continue;
            }

            let pcId = row[1];
            if (pcId && isNaN(parseInt(pcId))) {
                let found = this.state.productCategories.find(pc => pc.name.toLowerCase() === String(pcId).trim().toLowerCase());
                if (found) pcId = found.id;
            }
            let tcId = row[2];
            if (tcId && isNaN(parseInt(tcId))) {
                let found = this.state.tracerCategories.find(tc => tc.name.toLowerCase() === String(tcId).trim().toLowerCase());
                if (found) tcId = found.id;
            }
            let unitId = row[3];
            if (unitId && isNaN(parseInt(unitId))) {
                let found = this.state.units.find(u => u.name.toLowerCase() === String(unitId).trim().toLowerCase());
                if (found) unitId = found.id;
            }
            let fuName = row[5] ? row[5].toString().trim() : '';

            let identifier = fuId > 0
                ? `${i18n.t('static.bulk.id')}: ${fuId}`
                : (fuName !== '' ? `${i18n.t('static.bulk.name')}: "${fuName}"` : `${i18n.t('static.bulk.row')}: ${y + 1}`);

            // Clear previous styles for this row
            for (let c = 1; c <= 5; c++) {
                let cellCoord = colLetters[c] + (y + 1);
                this.el.setStyle(cellCoord, "background-color", "transparent");
                this.el.setComments(cellCoord, "");
            }

            // Col 1: Product Category required
            if (pcId === '' || pcId === null || pcId === undefined) {
                let cellCoord = "B" + (y + 1);
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

            // Col 2: Tracer Category required
            if (tcId === '' || tcId === null || tcId === undefined) {
                let cellCoord = "C" + (y + 1);
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

            // Col 3: Unit required
            if (unitId === '' || unitId === null || unitId === undefined) {
                let cellCoord = "D" + (y + 1);
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

            // Col 5: Forecasting Unit Name required and unique
            if (fuName === '') {
                let cellCoord = "F" + (y + 1);
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
                    let cellCoord = "F" + (y + 1);
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

            if (isRowChanged) {
                let pcId = parseInt(row[1]);
                if (isNaN(pcId) && row[1]) {
                    let found = this.state.productCategories.find(pc => pc.name.toLowerCase() === String(row[1]).trim().toLowerCase());
                    if (found) pcId = found.id;
                }
                let tcId = parseInt(row[2]);
                if (isNaN(tcId) && row[2]) {
                    let found = this.state.tracerCategories.find(tc => tc.name.toLowerCase() === String(row[2]).trim().toLowerCase());
                    if (found) tcId = found.id;
                }
                let uId = parseInt(row[3]);
                if (isNaN(uId) && row[3]) {
                    let found = this.state.units.find(u => u.name.toLowerCase() === String(row[3]).trim().toLowerCase());
                    if (found) uId = found.id;
                }
                let genericName = row[4] ? row[4].toString().trim() : '';
                let fuName = row[5] ? row[5].toString().trim() : '';
                let isActive = row[6] === 1 || row[6] === '1' || row[6] === true || row[6] === 'true' || String(row[6]).toLowerCase() === 'active';

                let fuObj = {
                    forecastingUnitId: fuId,
                    realm: {
                        id: currentRealmId
                    },
                    productCategory: {
                        id: pcId
                    },
                    tracerCategory: {
                        id: tcId
                    },
                    unit: {
                        id: uId
                    },
                    genericLabel: {
                        label_en: genericName
                    },
                    label: {
                        label_en: fuName
                    },
                    active: isActive
                };
                changedList.push(fuObj);
                indexMap.push(y);

                let pcObj = this.state.productCategories.find(pc => pc.id === pcId);
                let pcName = pcObj ? pcObj.name : pcId;
                let tcObj = this.state.tracerCategories.find(tc => tc.id === tcId);
                let tcName = tcObj ? tcObj.name : tcId;
                let uObj = this.state.units.find(u => u.id === uId);
                let uName = uObj ? uObj.name : uId;
                let statusName = isActive ? i18n.t('static.common.active') : i18n.t('static.dataentry.inactive');

                let changes = [];
                let isNew = fuId === 0;

                if (isNew) {
                    changes.push({ field: i18n.t('static.productcategory.productcategory'), newVal: pcName });
                    changes.push({ field: i18n.t('static.tracercategory.tracercategory'), newVal: tcName });
                    changes.push({ field: i18n.t('static.unit.unit'), newVal: uName });
                    if (genericName) {
                        changes.push({ field: i18n.t('static.product.productgenericname'), newVal: genericName });
                    }
                    changes.push({ field: i18n.t('static.common.status'), newVal: statusName });
                } else {
                    let orig = this.state.forecastingUnitList.find(f => f.forecastingUnitId === fuId);
                    if (orig) {
                        let origFuName = orig.label ? (orig.label.label_en || getLabelText(orig.label, this.state.lang) || '') : '';
                        let origPcId = orig.productCategory ? (orig.productCategory.id !== undefined ? orig.productCategory.id : orig.productCategory.productCategoryId) : '';
                        let origTcId = orig.tracerCategory ? (orig.tracerCategory.id !== undefined ? orig.tracerCategory.id : orig.tracerCategory.tracerCategoryId) : '';
                        let origUId = orig.unit ? (orig.unit.id !== undefined ? orig.unit.id : orig.unit.unitId) : '';
                        let origGen = orig.genericLabel ? (orig.genericLabel.label_en || getLabelText(orig.genericLabel, this.state.lang) || '') : '';
                        let origActive = !!orig.active;

                        if (origFuName !== fuName) {
                            changes.push({ field: i18n.t('static.forecastingunit.forecastingunit'), oldVal: origFuName, newVal: fuName });
                        }
                        if (parseInt(origPcId) !== pcId) {
                            let oldPcObj = this.state.productCategories.find(pc => pc.id === parseInt(origPcId));
                            changes.push({ field: i18n.t('static.productcategory.productcategory'), oldVal: oldPcObj ? oldPcObj.name : origPcId, newVal: pcName });
                        }
                        if (parseInt(origTcId) !== tcId) {
                            let oldTcObj = this.state.tracerCategories.find(tc => tc.id === parseInt(origTcId));
                            changes.push({ field: i18n.t('static.tracercategory.tracercategory'), oldVal: oldTcObj ? oldTcObj.name : origTcId, newVal: tcName });
                        }
                        if (parseInt(origUId) !== uId) {
                            let oldUObj = this.state.units.find(u => u.id === parseInt(origUId));
                            changes.push({ field: i18n.t('static.unit.unit'), oldVal: oldUObj ? oldUObj.name : origUId, newVal: uName });
                        }
                        if (origGen.trim() !== genericName.trim()) {
                            changes.push({ field: i18n.t('static.product.productgenericname'), oldVal: origGen || '-', newVal: genericName || '-' });
                        }
                        if (origActive !== isActive) {
                            changes.push({
                                field: i18n.t('static.common.status'),
                                oldVal: origActive ? i18n.t('static.common.active') : i18n.t('static.dataentry.inactive'),
                                newVal: statusName
                            });
                        }
                    }
                    if (changes.length === 0) {
                        changes.push({ field: i18n.t('static.common.status'), newVal: statusName });
                    }
                }

                submittedSummaryList.push({
                    id: fuId,
                    name: fuName,
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

        let totalCreated = changedList.filter(item => item.forecastingUnitId === 0).length;
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
        ForecastingUnitService.addForecastingUnitBulk(pendingChangedList)
            .then(response => {
                if (response.status === 200) {
                    let result = response.data;
                    let savedUnits = result.savedUnits || [];
                    let updatedFuList = [...this.state.forecastingUnitList];

                    for (let k = 0; k < savedUnits.length; k++) {
                        let rowIndex = pendingIndexMap[k];
                        let unit = savedUnits[k];
                        // Update forecastingUnitId in col 0
                        this.el.setValueFromCoords(0, rowIndex, unit.forecastingUnitId, true);
                        // Reset isChanged in col 7
                        this.el.setValueFromCoords(7, rowIndex, 0, true);
                        let existingIdx = updatedFuList.findIndex(f => f.forecastingUnitId === unit.forecastingUnitId);
                        if (existingIdx !== -1) {
                            updatedFuList[existingIdx] = unit;
                        } else {
                            updatedFuList.push(unit);
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
                        forecastingUnitList: updatedFuList,
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
        console.error("BulkForecastingUnitComponent error:", error);
        let msg = 'static.unkownError';
        if (error.message === "Network Error") {
            msg = API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage"));
        } else if (error.response) {
            console.error("Error response status:", error.response.status, "data:", error.response.data);
            switch (error.response.status) {
                case 401:
                    this.props.history.push(`/login/static.message.sessionExpired`);
                    return;
                case 403:
                    this.props.history.push(`/accessDenied`);
                    return;
                case 406:
                    msg = error.response.data && error.response.data.messageCode ? error.response.data.messageCode : 'static.message.forecastingUnitAlreadyExists';
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
        this.props.history.push('/forecastingUnit/listForecastingUnit');
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
                            <div id="forecastingUnitTableDiv"></div>
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


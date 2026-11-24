import React, { Component } from 'react';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import {
    Alert,
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
    Table
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import DropdownService from '../../api/DropdownService';
import PlanningUnitService from '../../api/PlanningUnitService';
import RealmService from '../../api/RealmService';
import UnitService from '../../api/UnitService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import { jExcelLoadedFunction, onOpenFilter } from '../../CommonComponent/JExcelCommonFunctions';
import csvicon from '../../assets/img/csv.png';

const entityname = i18n.t('static.planningunit.planningunit');

/**
 * Component for list and bulk inline editing of planning unit details.
 */
export default class PlanningUnitListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            realmId: '',
            units: [],
            forecastingUnits: [],
            planningUnitList: [],
            loading: true,
            isChanged: false,
            lang: localStorage.getItem('lang'),
            message: '',
            errorMessage: '',
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
            programList: [],
            exportModal: false,
            loadingModal: false
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
        this.addNewPlanningUnit = this.addNewPlanningUnit.bind(this);
        this.toggleExport = this.toggleExport.bind(this);
        this.getDataforExport = this.getDataforExport.bind(this);
    }

    componentDidMount() {
        hideFirstComponent();
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

    componentWillUnmount() {
        if (this.el) {
            jexcel.destroy(document.getElementById("tableDiv"), true);
        }
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
                let forecastingUnits = fus.map(item => {
                    let fuId = item.forecastingUnitId !== undefined ? item.forecastingUnitId : (item.id !== undefined ? item.id : '');
                    let fuName = item.label ? (item.label.label_en || getLabelText(item.label, this.state.lang) || '') : (item.name || '');
                    return {
                        id: fuId,
                        name: fuName ? `${fuName} | ${fuId}` : `${fuId}`
                    };
                }).filter(f => f.id !== '');

                forecastingUnits.sort((a, b) => a.name.localeCompare(b.name));

                let puList = (puRes.status === 'fulfilled' && puRes.value.data) ? puRes.value.data : [];

                this.changedRows.clear();
                this.setState({
                    units: unitList,
                    forecastingUnits: forecastingUnits,
                    planningUnitList: puList,
                    loading: false,
                    isChanged: false,
                    validationErrors: []
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
        let container = document.getElementById("tableDiv");
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
            let countPrograms = (pu.countOfSpPrograms || 0) + (pu.countOfFcPrograms || 0);
            let lastModBy = pu.lastModifiedBy ? pu.lastModifiedBy.username : '';
            let lastModDate = pu.lastModifiedDate ? moment(pu.lastModifiedDate).format('YYYY-MM-DD') : null;
            // Row follows manual entry order + reference columns:
            // 0: ID, 1: Associated FU, 2: Multiplier, 3: Product Name, 4: Unit of Measure, 5: Status,
            // 6: # Programs Using PU, 7: Last Updated By, 8: Last Updated Date, 9: isChanged
            let row = [
                pu.planningUnitId,
                fuId !== undefined && fuId !== null ? fuId : '',
                pu.multiplier,
                puName,
                uId !== undefined && uId !== null ? uId : '',
                pu.active ? '1' : '0',
                countPrograms,
                lastModBy,
                lastModDate,
                0 // isChanged: 0
            ];
            data.push(row);
        }

        let isEditable = AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT');

        let options = {
            data: data,
            columnDrag: false,
            columns: [
                { title: i18n.t('static.dataEntry.planningUnitId'), type: 'text', readOnly: true, width: 80 },
                { title: `${i18n.t('static.planningUnit.associatedForecastingUnit')} *`, type: 'dropdown', source: forecastingUnits, width: 300, autocomplete: true },
                { title: `${i18n.t('static.planningUnit.labelMultiplier')} *`, type: 'numeric', width: 120, mask: '#,##0', decimal: '.' },
                { title: `${i18n.t('static.product.productName')} *`, type: 'text', width: 250 },
                { title: `${i18n.t('static.planningUnit.planningUnitOfMeasure')} *`, type: 'dropdown', source: units, width: 160, autocomplete: true },
                { title: i18n.t('static.common.status'), type: 'dropdown', source: [{ id: '1', name: i18n.t('static.common.active') }, { id: '0', name: i18n.t('static.common.disabled') }], width: 100 },
                { title: i18n.t('static.program.noOfProgramsUsingPU'), type: 'text', readOnly: true, width: 120 },
                { title: i18n.t('static.common.lastModifiedBy'), type: 'text', readOnly: true, width: 120 },
                { title: i18n.t('static.common.lastModifiedDate'), type: 'calendar', options: { format: JEXCEL_DATE_FORMAT_SM }, readOnly: true, width: 130 },
                { title: 'isChanged', type: 'hidden' }
            ],
            editable: isEditable,
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
            allowInsertRow: isEditable,
            allowManualInsertRow: false,
            allowDeleteRow: isEditable,
            copyCompatibility: true,
            parseFormulas: true,
            license: JEXCEL_PRO_KEY,
            allowRenameColumn: false,
            onopenfilter: onOpenFilter,
            contextMenu: function (obj, x, y, e) {
                let items = [];
                if (isEditable) {
                    items.push({
                        title: i18n.t('static.common.addRow'),
                        onclick: function () {
                            this.addRow(1);
                        }.bind(this)
                    });
                }
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
                    if (isEditable) {
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
                            instance.insertRow([0, '', 1, '', '', '1', 0, '', null, 1]);
                        }
                    }
                }
                return data;
            },
            onpaste: this.onPaste,
            oneditionend: this.oneditionend,
            onload: function (instance, cell) {
                jExcelLoadedFunction(instance, cell);
                let order1 = document.querySelector('.consumptionDataEntryTable .order-1');
                if (order1) {
                    order1.classList.add('mr-2');
                }
            }
        };

        if (container) {
            this.el = jexcel(container, options);
        }
    }

    changed(instance, cell, x, y, value) {
        if (this.loadingTable) return;
        x = parseInt(x);
        y = parseInt(y);
        let rowId = instance.getValueFromCoords(0, y);
        if (!rowId || parseInt(rowId) === 0) {
            // newly added row
            instance.setValueFromCoords(9, y, 1, true);
            this.changedRows.add(y);
            this.setState({ isChanged: true });
            return;
        }
        let orig = this.state.planningUnitList.find(p => p.planningUnitId === parseInt(rowId));
        let isDifferent = false;
        if (!orig) {
            isDifferent = true;
        } else {
            let currentFuId = instance.getValueFromCoords(1, y);
            let currentMult = instance.getValueFromCoords(2, y);
            let currentPuName = (instance.getValueFromCoords(3, y) || '').trim();
            let currentUnit = instance.getValueFromCoords(4, y);
            let currentStatus = instance.getValueFromCoords(5, y);

            let origFuId = orig.forecastingUnit ? (orig.forecastingUnit.forecastingUnitId !== undefined ? orig.forecastingUnit.forecastingUnitId : orig.forecastingUnit.id) : '';
            let origMult = orig.multiplier;
            let origPuName = (orig.label ? (orig.label.label_en || getLabelText(orig.label, this.state.lang) || '') : '').trim();
            let origUnit = orig.unit ? (orig.unit.id !== undefined ? orig.unit.id : orig.unit.unitId) : '';
            let origStatus = orig.active ? '1' : '0';

            let curMultNum = Number(String(currentMult).replaceAll(",", ""));
            let origMultNum = Number(String(origMult).replaceAll(",", ""));

            if (String(currentFuId) !== String(origFuId) ||
                curMultNum !== origMultNum ||
                currentPuName !== origPuName ||
                String(currentUnit) !== String(origUnit) ||
                String(currentStatus) !== String(origStatus)) {
                isDifferent = true;
            }
        }
        if (isDifferent) {
            instance.setValueFromCoords(9, y, 1, true);
            this.changedRows.add(y);
            this.setState({ isChanged: true });
        } else {
            instance.setValueFromCoords(9, y, 0, true);
            this.changedRows.delete(y);
            let hasChanges = false;
            let allData = instance.getJson(null, false);
            for (let r = 0; r < allData.length; r++) {
                let rId = allData[r][0] ? parseInt(allData[r][0]) : 0;
                if (this.changedRows.has(r) || rId === 0) {
                    hasChanges = true;
                    break;
                }
            }
            this.setState({ isChanged: hasChanges });
        }
    }

    oneditionend(instance, cell, x, y, value) {
        this.changed(instance, cell, x, y, value);
    }

    onPaste() {
        this.setState({ isChanged: true });
        setTimeout(() => {
            let json = this.el.getJson(null, false);
            for (let y = 0; y < json.length; y++) {
                if (!json[y][0] || json[y][0] === '' || json[y][0] === 0 || json[y][0] === '0') {
                    this.el.setValueFromCoords(0, y, 0, true);
                    this.el.setValueFromCoords(9, y, 1, true);
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
                0,   // 6: # Programs Using PU
                '',  // 7: Last Updated By
                null,// 8: Last Updated Date
                1    // 9: isChanged
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
        let confirmReset = window.confirm(i18n.t('static.program.resetConfirm') || 'Are you sure you want to reset all changes?');
        if (confirmReset) {
            this.changedRows.clear();
            this.setState({ isChanged: false, validationErrors: [] }, () => {
                this.buildJexcel();
            });
        }
    }

    cancelClicked() {
        if (this.state.isChanged) {
            let confirmCancel = window.confirm(i18n.t('static.common.cancelConfirm') || 'Are you sure you want to cancel? Unsaved changes will be lost.');
            if (!confirmCancel) return;
        }
        this.changedRows.clear();
        this.setState({ isChanged: false, validationErrors: [] }, () => {
            this.loadDependencies(this.state.realmId);
        });
    }

    addNewPlanningUnit() {
        if (localStorage.getItem("sessionType") === 'Online') {
            this.props.history.push(`/planningUnit/addPlanningUnit`);
        } else {
            alert(i18n.t('static.common.online'));
        }
    }

    exportTemplate() {
        let workbook = new Workbook();
        let sheetName = i18n.t('static.planningunit.planningunit').replace(/[*?:\\/[\]]/g, ' ').substring(0, 31).trim();
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
            lookupSheet.addRow({
                fu: fuList[r] || '',
                unit: uList[r] || ''
            });
        }

        worksheet.columns = [
            { header: `${i18n.t('static.planningUnit.associatedForecastingUnit')} *`, key: 'fu', width: 40 },
            { header: `${i18n.t('static.planningUnit.labelMultiplier')} *`, key: 'multiplier', width: 15 },
            { header: `${i18n.t('static.product.productName')} *`, key: 'puName', width: 35 },
            { header: `${i18n.t('static.planningUnit.planningUnitOfMeasure')} *`, key: 'unit', width: 25 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        for (let rowNum = 2; rowNum <= 1000; rowNum++) {
            if (fuList.length > 0) {
                worksheet.getCell(`A${rowNum}`).dataValidation = {
                    type: 'list',
                    allowBlank: false,
                    formulae: [`LookupData!$A$2:$A$${fuList.length + 1}`]
                };
            }
            if (uList.length > 0) {
                worksheet.getCell(`D${rowNum}`).dataValidation = {
                    type: 'list',
                    allowBlank: false,
                    formulae: [`LookupData!$B$2:$B$${uList.length + 1}`]
                };
            }
        }

        workbook.xlsx.writeBuffer().then(buffer => {
            fs.saveAs(new Blob([buffer]), `${i18n.t('static.planningunit.planningunit')}_Template.xlsx`);
        });
    }

    openProgramsModal(puId, puName) {
        this.setState({
            programsModal: true,
            programsLoading: true,
            selectedEntityName: puName,
            programList: []
        });

        PlanningUnitService.getPlanningUnitByIdWithPrograms(puId)
            .then(res => {
                if (res.status === 200 && res.data) {
                    let combinedProgramList = [];

                    if (res.data.spProgramListActive) {
                        res.data.spProgramListActive.forEach(item => {
                            combinedProgramList.push({
                                code: item.code || (item.program ? item.program.code : '-'),
                                module: i18n.t('static.supplyPlan.supplyPlan'),
                                status: 1
                            });
                        });
                    }

                    if (res.data.fcProgramListActive) {
                        res.data.fcProgramListActive.forEach(item => {
                            combinedProgramList.push({
                                code: item.code || (item.program ? item.program.code : '-'),
                                module: i18n.t('static.dashboard.forecasting'),
                                status: 1
                            });
                        });
                    }

                    combinedProgramList.sort((a, b) => ((a.code || '') > (b.code || '') ? 1 : -1));

                    let inActivePrograms = [];
                    if (res.data.spProgramListDisabled) {
                        res.data.spProgramListDisabled.forEach(item => {
                            inActivePrograms.push({
                                code: item.code || (item.program ? item.program.code : '-'),
                                module: i18n.t('static.supplyPlan.supplyPlan'),
                                status: 0
                            });
                        });
                    }

                    if (res.data.fcProgramListDisabled) {
                        res.data.fcProgramListDisabled.forEach(item => {
                            inActivePrograms.push({
                                code: item.code || (item.program ? item.program.code : '-'),
                                module: i18n.t('static.dashboard.forecasting'),
                                status: 0
                            });
                        });
                    }

                    inActivePrograms.sort((a, b) => ((a.code || '') > (b.code || '') ? 1 : -1));

                    let finalProgramList = [...combinedProgramList, ...inActivePrograms];
                    this.setState({ programList: finalProgramList, programsLoading: false });
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
        let colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

        for (let y = 0; y < json.length; y++) {
            let row = json[y];
            let pageNum = Math.floor(y / pageSize) + 1;
            let puId = row[0] ? parseInt(row[0]) : 0;
            let isRowChanged = this.changedRows.has(y) || puId === 0 || row[9] === 1 || row[9] === '1' || parseInt(this.el.getValueFromCoords(9, y)) === 1;

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
            let isRowChanged = this.changedRows.has(y) || puId === 0 || row[9] === 1 || row[9] === '1' || parseInt(this.el.getValueFromCoords(9, y)) === 1;

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
                        this.el.setValueFromCoords(9, y, 0, true);
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
                    this.changedRows.clear();
                    this.setState({
                        isChanged: false,
                        message: 'static.message.updateSuccess',
                        color: 'green',
                        loading: false
                    }, () => {
                        this.loadDependencies(this.state.realmId);
                    });
                } else {
                    this.setState({
                        errorMessage: response.data ? response.data.messageCode : 'static.actionFailed',
                        color: 'red',
                        loading: false
                    }, () => {
                        hideSecondComponent();
                    });
                }
            })
            .catch(error => {
                this.setState({ loading: false });
                this.handleError(error);
            });
    }

    toggleReviewModal() {
        this.setState({ reviewModal: !this.state.reviewModal });
    }

    handleError(error) {
        if (error.message === "Network Error") {
            this.setState({
                errorMessage: API_URL.includes("uat")
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
                        errorMessage: i18n.t('static.common.accessDenied'),
                        loading: false,
                        color: "red",
                    });
                    break;
                case 403:
                    this.props.history.push(`/accessDenied`);
                    break;
                default:
                    this.setState({
                        errorMessage: (error.response && error.response.data && error.response.data.messageCode) ? error.response.data.messageCode : 'static.unkownError',
                        loading: false,
                        color: 'red'
                    });
                    break;
            }
        }
    }

    toggleExport() {
        this.setState({
            exportModal: !this.state.exportModal
        });
    }

    getDataforExport() {
        this.setState({
            loadingModal: true
        });
        PlanningUnitService.getPlanningUnitByRealmId(this.state.realmId)
            .then(response => {
                if (response.status === 200) {
                    var csvRow = [];
                    csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"');
                    csvRow.push('');
                    this.setState({
                        exportModal: false,
                    });
                    if (response.data && response.data.length > 0) {
                        var A = [];
                        let tableHeadTemp = [];
                        tableHeadTemp.push(i18n.t('static.dataEntry.planningUnitId').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.product.productName').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.planningUnit.associatedForecastingUnit').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.planningUnit.planningUnitOfMeasure').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.planningUnit.labelMultiplier').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.program.noOfProgramsUsingPU').replaceAll('#', '%23').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.common.lastModifiedBy').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.common.lastModifiedDate').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.common.status').replaceAll(' ', '%20'));
                        A[0] = addDoubleQuoteToRowContent(tableHeadTemp);
                        let planningUnitList = response.data;
                        for (var j = 0; j < planningUnitList.length; j++) {
                            let puLabel = (getLabelText(planningUnitList[j].label, this.state.lang) + " | " + planningUnitList[j].planningUnitId).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20');
                            let fuLabel = planningUnitList[j].forecastingUnit ? (getLabelText(planningUnitList[j].forecastingUnit.label, this.state.lang) + " | " + planningUnitList[j].forecastingUnit.forecastingUnitId).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20') : '';
                            let uLabel = planningUnitList[j].unit ? getLabelText(planningUnitList[j].unit.label, this.state.lang).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20') : '';
                            let countPrograms = ((planningUnitList[j].countOfSpPrograms || 0) + (planningUnitList[j].countOfFcPrograms || 0)).toString();
                            let modBy = planningUnitList[j].lastModifiedBy ? planningUnitList[j].lastModifiedBy.username.replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20') : '';
                            let modDate = planningUnitList[j].lastModifiedDate ? moment(planningUnitList[j].lastModifiedDate).format(DATE_FORMAT_CAP) : '';
                            let statusText = planningUnitList[j].active ? i18n.t('static.common.active') : i18n.t('static.common.disabled');

                            A.push([addDoubleQuoteToRowContent([
                                planningUnitList[j].planningUnitId,
                                puLabel,
                                fuLabel,
                                uLabel,
                                (planningUnitList[j].multiplier || 1).toString(),
                                countPrograms,
                                modBy,
                                modDate,
                                statusText
                            ])]);
                        }
                        for (var i = 0; i < A.length; i++) {
                            csvRow.push(A[i].join(","));
                        }
                    }
                    var csvString = csvRow.join("%0A");
                    var a = document.createElement("a");
                    a.href = 'data:attachment/csv,' + csvString;
                    a.target = "_Blank";
                    a.download = i18n.t('static.dashboard.planningunit') + ".csv";
                    document.body.appendChild(a);
                    a.click();
                    this.setState({
                        loadingModal: false
                    });
                } else {
                    this.setState({
                        exportModal: false,
                        loadingModal: false
                    });
                }
            })
            .catch(error => {
                this.setState({
                    exportModal: false,
                    loadingModal: false
                });
                this.handleError(error);
            });
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

        let hasEditRole = AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT');
        let hasAddRole = AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_PLANNING_UNIT');
        let showRealmColumn = AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN');

        let displayMessage = this.props.match && this.props.match.params && this.props.match.params.message
            ? this.props.match.params.message
            : this.state.message;
        let displayColor = this.props.match && this.props.match.params && this.props.match.params.color
            ? this.props.match.params.color
            : this.state.color;

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent
                    history={this.props.history}
                    message={(message) => this.setState({ errorMessage: message })}
                    loading={(loading) => this.setState({ loading })}
                />
                <h5 className={displayColor} id="div1">
                    <strong>{i18n.t(displayMessage, { entityname })}</strong>
                </h5>
                <h5 className="red" id="div2">
                    {i18n.t(this.state.errorMessage, { entityname })}
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
                            <div className="card-header-action d-flex align-items-center">
                                {hasAddRole && (
                                    <a
                                        href="javascript:void(0);"
                                        className="d-flex align-items-center"
                                        title={i18n.t('static.common.addEntity', { entityname })}
                                        onClick={(e) => { e.preventDefault(); this.addNewPlanningUnit(); }}
                                    >
                                        <i className="fa fa-plus-square"></i>
                                    </a>
                                )}
                                {(hasEditRole || hasAddRole) && (
                                    <a
                                        href="javascript:void(0);"
                                        className="ml-2 d-flex align-items-center"
                                        title={i18n.t('static.bulk.downloadTemplateBulkAdding')}
                                        onClick={(e) => { e.preventDefault(); this.exportTemplate(); }}
                                    >
                                        <i className="fa fa-pencil-square-o"></i>
                                    </a>
                                )}
                                <img
                                    className="ml-2"
                                    style={{ height: '25px', width: '25px', cursor: 'pointer' }}
                                    src={csvicon}
                                    title={i18n.t('static.report.exportCsv')}
                                    onClick={() => this.toggleExport()}
                                    alt="CSV Export"
                                />
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0">
                        {showRealmColumn && (
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
                            <div id="tableDiv"></div>
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
                    {hasEditRole && (
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
                    )}
                </Card>

                {/* Programs Modal */}
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

                {/* CSV Export Modal */}
                <Modal isOpen={this.state.exportModal} className={'modal-md'}>
                    <ModalHeader toggle={() => this.toggleExport()} className="modalHeaderSupplyPlan" id="shipmentModalHeader">
                        <strong>{i18n.t("static.supplyPlan.exportAsCsv")}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <p>{i18n.t('static.report.exportCsv')} - {i18n.t('static.planningunit.planningunit')}</p>
                        <div style={{ display: this.state.loadingModal ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "150px" }}>
                                <div className="align-items-center">
                                    <h4><strong>{i18n.t('static.common.loading')}</strong></h4>
                                    <div className="spinner-border blue ml-4" role="status"></div>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => this.toggleExport()}>
                            <i className="fa fa-times"></i>{i18n.t("static.common.cancel")}
                        </Button>
                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.getDataforExport()}>
                            <i className="fa fa-check"></i>{i18n.t("static.common.submit")}
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';
import jexcel from 'jspreadsheet';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';

import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import IntegrationService from '../../api/IntegrationService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmService from "../../api/RealmService";
import ProcurementAgentService from '../../api/ProcurementAgentService';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { API_URL, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM, SPACE_REGEX } from '../../Constants.js';
import classNames from 'classnames';
import { responsiveFontSizes } from '@material-ui/core';

const initialValues = {
    label: ""
}
const entityname = i18n.t('static.integration.integration');
const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
    })
}

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
}

const getErrorsFromValidationError = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}


export default class AddDimensionComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            program: {
                id: this.props.match.params.programId,
                label_en: '',
                procurementAgent: [],
            },
            message: '',
            loading: true,
            isHide: true,
            bodyParameter: '',
            procurementAgents: []
        }
        this.resetClicked = this.resetClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
        jExcelLoadedFunctionOnlyHideRow(instance);
        // var asterisk = document.getElementsByClassName("resizable")[0];
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        // tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');

    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    touchAll(setTouched, errors) {
        setTouched({
            programId: true,
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstError(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }
    dataChange(roleId) {

    }

    buildJexcel() {
        var procurementAgentList = this.state.selectedProcurementAgentList;

        var data = [];
        var procurementAgentArr = [];

        var count = 0;
        if (procurementAgentList.length != 0) {
            for (var j = 0; j < procurementAgentList.length; j++) {
                data = [];
                data[0] = procurementAgentList[j].id
                data[1] = procurementAgentList[j].code
                count++;
            }
        }

       

        if (this.state.table1Instance != "" && this.state.table1Instance != undefined) {
            // this.state.table1Instance.destroy();
            jexcel.destroy(document.getElementById("paputableDiv"), true);
        }

        // if (this.state.table2Instance != "" && this.state.table2Instance != undefined) {
        //     // this.state.table2Instance.destroy();
        //     jexcel.destroy(document.getElementById("eqUnitInfoTable"), true);
        // }
        var json = [];
        var data = procurementAgentArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100, 50],
            columns: [

                {
                    title: 'procurementAgentId',
                    type: 'hidden',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.equivalancyUnit.equivalancyUnitName'),
                    type: 'autocomplete',
                    source: this.state.equivalancyUnitList,
                    filter: this.filterEquivalancyUnit
                }

            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el;
                    var rowData = elInstance.getRowData(y);

                    //left align
                    elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');

                    var typeId = rowData[14];
                    // console.log("updateTable------>", rowData[11]);                    

                    let checkReadOnly = 0;
                    if ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_OWN') && typeId == -1 && typeId != 0)) {
                        checkReadOnly = checkReadOnly + 1;

                        // var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        // cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    }

                    var addRowId = rowData[15];
                    // console.log("addRowId------>", addRowId);
                    if (addRowId == 1) {//active grade out
                        var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else if (checkReadOnly == 0) {
                        var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    }

                    if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_ALL')
                        && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_OWN')) {
                        // var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        // cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    }


                }
            }.bind(this),

            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            // tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            onchange: this.changed,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            // onpaste: this.onPaste,
            oneditionend: this.oneditionend,
            // text: {
            //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            onload: this.loaded,
            editable: true,
            // editable: (( AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_MODELING_TYPE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_MODELING_TYPE') ) ? true : false),
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                //Add consumption batch info


                if (y == null) {

                } else {

                    // Insert new row before
                    if (obj.options.allowInsertRow == true) {
                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_EQUIVALENCY_UNIT')) {
                            items.push({
                                title: i18n.t('static.common.addRow'),
                                onclick: function () {
                                    this.addRow();
                                }.bind(this)
                            });
                        }
                    }

                    // Delete a row
                    if (obj.options.allowDeleteRow == true) {
                        // region id
                        if (obj.getRowData(y)[0] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                    this.setState({ countVar: this.state.countVar - 1 })
                                }
                            });
                            // Line
                            // items.push({ type: 'line' });
                        }
                    }
                }

                return items;
            }.bind(this)
        };

        var table1Instance = jexcel(document.getElementById("paputableDiv"), options);
        this.el = table1Instance;
        this.setState({
            table1Instance: table1Instance,
            loading: false,
            countVar: count
        })
    }


    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.setState({ loading: false })
            ProcurementAgentService.getProcurementAgentForProgram(this.state.program.id)
            .then(response => {
                console.log("Hello",response.data)
                this.setState({
                    program: {
                        id: response.data.program.id,
                        name: response.data.program.code
                    },
                    selectedProcurementAgentList: response.data.selectedProcurementAgentList,
                    procurementAgentList: response.data.procurementAgentList,
                    loading: false
                })

            })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
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

    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    render() {

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "#BA0C2F" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}

                            <div id="paputableDiv" className="AddListbatchtrHeight RemoveStriped consumptionDataEntryTable">
                            </div>

                        </Card>
                    </Col>
                </Row>

            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/integration/listIntegration/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        this.state.integrationName = ''
        this.state.integrationView.integrationViewId = ''
        this.state.realm.id = ''
        this.state.folderLocation = ''
        this.state.fileName = ''
        this.state.isHide = true
        this.state.bodyParameter = ''

        let { integration } = this.state
        this.setState(
            {
                integration
            }
        )
    }
} 
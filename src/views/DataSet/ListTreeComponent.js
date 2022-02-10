import React, { Component } from 'react';
import DatasetService from '../../api/DatasetService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Card, CardHeader, CardBody, Button, Col, FormGroup, Label, InputGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader, CardFooter, FormFeedback, Form } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import i18n from '../../i18n';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js'
import CryptoJS from 'crypto-js'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
const entityname = i18n.t('static.common.listtree');

const validationSchema = function (values) {
    return Yup.object().shape({
        treeName: Yup.string()
            .required(i18n.t('static.validation.selectTreeName')),
    })
}

const initialValues = {
    treeName: "",
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

export default class ListTreeComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            treeTemplateList: [],
            treeData: [],
            datasetList: [],
            message: '',
            loading: true,
            treeName: '',
            isModalOpen: false,
            programId: '',
            versionId: '',
            treeId: '',
            datasetId: ''
        }
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.buildTree = this.buildTree.bind(this);
        this.onTemplateChange = this.onTemplateChange.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.getTreeList = this.getTreeList.bind(this);
        this.getTreeTemplateList = this.getTreeTemplateList.bind(this);
        this.copyDeleteTree = this.copyDeleteTree.bind(this);
        this.modelOpenClose = this.modelOpenClose.bind(this);
    }


    touchAll(setTouched, errors) {
        setTouched({
            'picker1': true,
            'picker2': true,
            'number1': true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('modalForm', (fieldName) => {
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

    copyDeleteTree(treeId, programId, versionId, operationId) {

        console.log("TreeId--------------->", treeId, programId, versionId, operationId);
        var program = (this.state.datasetList.filter(x => x.programId == programId && x.version == versionId)[0]);
        let tempProgram = JSON.parse(JSON.stringify(program))

        if (operationId == 1) {//delete
            let treeList = program.programData.treeList;
            const index = treeList.findIndex(c => c.treeId == treeId);
            if (index > 0) {
                const result = treeList.splice(index, 1);
            }
            tempProgram.programData.treeList = treeList;
        } else {//copy
            let treeList = program.programData.treeList;
            let treeName = this.state.treeName;

            for (let i = 0; i < treeList.length; i++) {
                if (treeList[i].treeId == treeId) {
                    let treeObj = JSON.parse(JSON.stringify(treeList[i]));
                    let maxTreeId = treeList.length > 0 ? Math.max(...treeList.map(o => o.treeId)) : 0;
                    treeObj.treeId = maxTreeId + 1;
                    treeObj.label = {
                        "createdBy": null,
                        "createdDate": null,
                        "lastModifiedBy": null,
                        "lastModifiedDate": null,
                        "active": true,
                        "labelId": '',
                        "label_en": treeName,
                        "label_sp": null,
                        "label_fr": null,
                        "label_pr": null
                    }

                    treeList.push(treeObj);
                    break;
                }
            }

            console.log("TreeId--------------->12", treeList);
            tempProgram.programData.treeList = treeList;
        }

        var programData = (CryptoJS.AES.encrypt(JSON.stringify(tempProgram.programData), SECRET_KEY)).toString();
        tempProgram.programData = programData;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var programTransaction = transaction.objectStore('datasetData');

            var programRequest = programTransaction.put(tempProgram);
            console.log("---hurrey---");

            transaction.oncomplete = function (event) {

                this.setState({
                    // loading: false,
                    message: i18n.t('static.mt.dataUpdateSuccess'),
                    color: "green",
                }, () => {
                    this.getDatasetList();
                });
                console.log("Data update success1");
                // alert("success");


            }.bind(this);
            transaction.onerror = function (event) {
                this.setState({
                    loading: false,
                    color: "red",
                }, () => {
                    this.hideSecondComponent();
                });
                console.log("Data update errr");
            }.bind(this);
        }.bind(this);


    }


    getTreeTemplateList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['treeTemplate'], 'readwrite');
            var program = transaction.objectStore('treeTemplate');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var treeTemplateList = myResult.filter(x => x.active == true);
                treeTemplateList.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    treeTemplateList
                });
                // for (var i = 0; i < myResult.length; i++) {
                //     console.log("treeTemplateList--->", myResult[i])

                // }

            }.bind(this);
        }.bind(this);
    }

    getTreeList(datasetId) {
        // var proList = [];
        var datasetList = this.state.datasetList;
        console.log("filter tree---", datasetList);
        if (datasetId != 0) {
            datasetList = datasetList.filter(x => x.id == datasetId);
            console.log('inside if')
            // proList.push(datasetList)
        }

        // console.log("pro list---", proList);
        this.setState({
            datasetId,
            treeData: datasetList
        }, () => {
            this.buildJexcel();
        });
    }
    getDatasetList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                for (var i = 0; i < myResult.length; i++) {
                    console.log("myResult[i].programData---", myResult[i].programData);
                    var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                    var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                    console.log("myResult[i].programData after---", programData);
                    myResult[i].programData = programData;
                }
                this.setState({
                    datasetList: myResult
                }, () => {
                    var datasetId = this.state.datasetId != "" && this.state.datasetId != 0 ? this.state.datasetId : 0;
                    this.getTreeList(datasetId);
                });

            }.bind(this);
        }.bind(this);
    }

    onTemplateChange(event) {
        if (event.target.value == 0 || event.target.value == "") {
            this.buildTree();
        } else {
            this.props.history.push({
                pathname: `/dataSet/buildTree/template/${event.target.value}`,
                // state: { role }
            });
        }

    }

    buildTree() {

        this.props.history.push({
            pathname: `/dataSet/buildTree/`,
            // state: { role }
        });

    }
    buildJexcel() {
        let programList = this.state.treeData;
        console.log(">>>", programList);
        let treeArray = [];
        let count = 0;
        for (var j = 0; j < programList.length; j++) {
            console.log("programList[j]---", programList[j]);
            var treeList = programList[j].programData.treeList;

            if (treeList.length > 0) {
                for (var k = 0; k < treeList.length; k++) {
                    data = [];
                    data[0] = treeList[k].treeId
                    data[1] = programList[j].programCode + "~v" + programList[j].programData.currentVersion.versionId
                    // data[1] = programList[j].programCode
                    data[2] = getLabelText(treeList[k].label, this.state.lang)
                    data[3] = treeList[k].regionList.map(x => getLabelText(x.label, this.state.lang)).join(", ")
                    console.log("forecast method--->", treeList[k].forecastMethod.label)
                    data[4] = getLabelText(treeList[k].forecastMethod.label, this.state.lang)
                    data[5] = treeList[k].scenarioList.map(x => getLabelText(x.label, this.state.lang)).join(", ")
                    data[6] = treeList[k].notes
                    data[7] = programList[j].programId
                    data[8] = programList[j].id
                    data[9] = programList[j].version
                    data[10] = treeList[k].active
                    treeArray[count] = data;
                    count++;
                }
            }
        }
        const sortArray = (sourceArray) => {
            const sortByName = (a, b) => a[2].localeCompare(b[2], 'en', { numeric: true });
            return sourceArray.sort(sortByName);
        };

        if (treeArray.length > 0) {
            sortArray(treeArray);
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = treeArray;

        var options = {
            data: data,
            columnDrag: true,
            // colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Tree Id',
                    type: 'hidden'
                },
                {
                    title: i18n.t('static.dashboard.programheader'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.treeName'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.region'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.forecastMethod.forecastMethod'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.common.scenarioName'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'ProgramId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'id',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'versionId',
                    type: 'hidden',
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
                }

            ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
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
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.deleteTree'),
                            onclick: function () {
                                confirmAlert({
                                    message: "Are you sure you want to delete this tree.",
                                    buttons: [
                                        {
                                            label: i18n.t('static.program.yes'),
                                            onClick: () => {
                                                this.copyDeleteTree(this.el.getValueFromCoords(0, y), this.el.getValueFromCoords(7, y), this.el.getValueFromCoords(9, y), 1);
                                            }
                                        },
                                        {
                                            label: i18n.t('static.program.no')
                                        }
                                    ]
                                });

                            }.bind(this)
                        });

                        items.push({
                            title: i18n.t('static.common.duplicateTree'),
                            onclick: function () {
                                this.setState({
                                    programId: this.el.getValueFromCoords(7, y),
                                    versionId: this.el.getValueFromCoords(9, y),
                                    treeId: this.el.getValueFromCoords(0, y),
                                    isModalOpen: !this.state.isModalOpen,
                                    treeName: ''
                                })
                            }.bind(this)
                        });
                    }
                }

                return items;
            }.bind(this),
        };
        var treeEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = treeEl;
        this.setState({
            treeEl: treeEl, loading: false
        })
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    componentDidMount() {
        this.hideFirstComponent();
        this.getDatasetList();
        this.getTreeTemplateList();
    }
    modelOpenClose() {
        this.setState({
            isModalOpen: !this.state.isModalOpen,
        })
    }
    dataChange(event) {
        if (event.target.name == "treeName") {
            this.setState({
                treeName: event.target.value,
            });
        }
    };
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    selected = function (instance, cell, x, y, value) {
        if (x == 0 && value != 0) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE')) {
                var treeId = this.el.getValueFromCoords(0, x);
                var programId = this.el.getValueFromCoords(8, x);
                console.log("programId>>>", programId);
                this.props.history.push({
                    pathname: `/dataSet/buildTree/tree/${treeId}/${programId}`,
                    // state: { role }
                });
            }

        }
    }.bind(this);

    // addNewDimension() {
    //     if (isSiteOnline()) {
    //         this.props.history.push(`/diamension/addDiamension`)
    //     } else {
    //         alert("You must be Online.")
    //     }

    // }

    render() {
        const { datasetList } = this.state;
        let datasets = datasetList.length > 0
            && datasetList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {item.programCode + "~v" + item.programData.currentVersion.versionId}
                    </option>
                )
            }, this);

        const { treeTemplateList } = this.state;
        let treeTemplates = treeTemplateList.length > 0
            && treeTemplateList.map((item, i) => {
                return (
                    <option key={i} value={item.treeTemplateId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);


        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <Col md="12 pl-0 pr-lg-0">
                                    <div className="d-md-flex">
                                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_TREE') &&
                                            // <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.createTreeFromTemplate')}</Button>
                                            // <Col md="3" className="pl-0">
                                            <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                                {/* <Label htmlFor="appendedInputButton">{i18n.t('static.forecastProgram.forecastProgram')}</Label> */}
                                                <div className="controls SelectGo">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="templateId"
                                                            id="templateId"
                                                            bsSize="sm"
                                                            className="addtreebg"
                                                            onChange={(e) => { this.onTemplateChange(e) }}
                                                        >
                                                            <option value="">{i18n.t('static.tree.+AddTree')}</option>
                                                            <option value="0">{i18n.t('static.tree.blank')}</option>
                                                            {treeTemplates}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            // </Col>
                                        }
                                        {/* {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_LIST_REALM_COUNTRY') &&
                                            <FormGroup className="tab-ml-1 mt-md-1 mb-md-0 ">
                                                <Button type="submit" size="md" color="info" onClick={this.buildTree} className="float-right pt-1 pb-1" ><i className="fa fa-plus"></i>  {i18n.t('static.common.addtree')}</Button>
                                            </FormGroup>
                                        } */}
                                    </div>
                                </Col>
                            </div>
                        </div>

                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        <Col md="3" className="pl-0">
                            <FormGroup className="Selectdiv">
                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                <div className="controls SelectGo">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="datasetId"
                                            id="datasetId"
                                            bsSize="sm"
                                            onChange={(e) => { this.getTreeList(e.target.value) }}
                                        >
                                            <option value="0">{i18n.t('static.common.all')}</option>
                                            {datasets}
                                        </Input>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        {/* <div id="loader" className="center"></div> */}
                        <div className="listtreetable">
                            <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DIMENSION') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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

                    <Modal isOpen={this.state.isModalOpen}
                        className={'modal-md ' + this.props.className}>
                        <ModalHeader>
                            <strong>Tree Details</strong>
                        </ModalHeader>
                        <ModalBody className='pb-lg-0'>
                            {/* <h6 className="red" id="div3"></h6> */}
                            <Col sm={12} style={{ flexBasis: 'auto' }}>
                                {/* <Card> */}
                                <Formik
                                    initialValues={initialValues}
                                    validate={validate(validationSchema)}
                                    onSubmit={(values, { setSubmitting, setErrors }) => {

                                        this.copyDeleteTree(this.state.treeId, this.state.programId, this.state.versionId, 2);
                                        this.setState({
                                            isModalOpen: !this.state.isModalOpen,
                                        })

                                    }}


                                    render={
                                        ({
                                            values,
                                            errors,
                                            touched,
                                            handleChange,
                                            handleBlur,
                                            handleSubmit,
                                            isSubmitting,
                                            isValid,
                                            setTouched,
                                            handleReset
                                        }) => (
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='modalForm' autocomplete="off">
                                                {/* <CardBody> */}
                                                <div className="row">

                                                    <FormGroup className="col-md-12">
                                                        <Label for="number1">Tree Name<span className="red Reqasterisk">*</span></Label>
                                                        <div className="controls">
                                                            <Input type="text"
                                                                bsSize="sm"
                                                                name="treeName"
                                                                id="treeName"
                                                                valid={!errors.treeName && this.state.treeName != ''}
                                                                invalid={touched.treeName && !!errors.treeName}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                required
                                                                value={this.state.treeName}
                                                            />
                                                            <FormFeedback className="red">{errors.treeName}</FormFeedback>
                                                        </div>

                                                    </FormGroup>
                                                    <FormGroup className="col-md-12 float-right pt-lg-4">
                                                        <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.modelOpenClose}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;

                                                    </FormGroup>
                                                </div>
                                                {/* <CardFooter>
                                                        <FormGroup>
                                                            <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.modelOpenClose}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                            <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                            &nbsp;

                                                        </FormGroup>
                                                    </CardFooter> */}
                                            </Form>

                                        )} />

                                {/* </Card> */}
                            </Col>
                            <br />
                        </ModalBody>
                    </Modal>

                </Card>

            </div>
        );
    }
}
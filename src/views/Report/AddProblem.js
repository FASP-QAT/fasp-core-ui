import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import moment from "moment";
import CryptoJS from 'crypto-js'
import { SECRET_KEY, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, INDEXED_DB_VERSION, INDEXED_DB_NAME } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";

const initialValues = {
  programId: '',
  problemId: '',
  planningUnitId: ''
}
const entityname = i18n.t('static.problem.problem');
const validationSchema = function (values) {
  return Yup.object().shape({
    programId: Yup.string()
      .required(i18n.t('static.budget.programtext')),
    problemId: Yup.string()
      .required(i18n.t('static.addProblem.problemError')),
    planningUnitId: Yup.string()
      .required(i18n.t('static.procurementUnit.validPlanningUnitText')),

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
class AddRoleComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: localStorage.getItem('lang'),
      programList: [],
      planningUnitList: [],
      regionList: [],
      problemList: [],
      message: ''
    }
    this.cancelClicked = this.cancelClicked.bind(this);
    this.resetClicked = this.resetClicked.bind(this);
    // this.dataChange = this.dataChange.bind(this);
    this.hideSecondComponent = this.hideSecondComponent.bind(this);
    this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
    this.addProblem = this.addProblem.bind(this);

  }

  hideSecondComponent() {
    document.getElementById('div2').style.display = 'block';
    setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 8000);
  }

  touchAll(setTouched, errors) {
    setTouched({
      programId: true,
      planningUnitId: true,
      problemId: true
      // businessFunctions: true,
      // canCreateRoles: true
    }
    )
    this.validateForm(errors)
  }
  validateForm(errors) {
    this.findFirstError('roleForm', (fieldName) => {
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

  componentDidMount() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: 'red'
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
          color: 'red'
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
            var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson1 = JSON.parse(programData);
            var programJson = {
              name: getLabelText(JSON.parse(programNameLabel), this.state.lang) + " - " + programJson1.programCode + "~v" + myResult[i].version,
              id: myResult[i].id
            }
            proList.push(programJson)
          }
        }
        this.setState({
          programList: proList
        })

        // openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transactionP = db1.transaction(['problem'], 'readwrite');
        var problem = transactionP.objectStore('problem');
        var getRequestP = problem.getAll();
        // var proList = []
        getRequestP.onerror = function (event) {
          this.setState({
            message: i18n.t('static.program.errortext'),
            color: 'red'
          })
        }.bind(this);
        getRequestP.onsuccess = function (event) {
          var probList = [];
          probList = getRequestP.result;
          var filteredList = probList.filter(c => c.problemType.id != 1)
          // console.log("problemList====>", filteredList);
          this.setState({ problemList: filteredList });

        }.bind(this);

      }.bind(this);
    }.bind(this)


  }

  getPlanningUnitList(event) {
    var db1;
    var storeOS;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: 'red'
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
      var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
      var planningunitRequest = planningunitOs.getAll();
      var planningList = []
      planningunitRequest.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: 'red'
        })
      }.bind(this);
      planningunitRequest.onsuccess = function (e) {
        var myResult = [];
        myResult = planningunitRequest.result;

        var planningUnitTransactionAll = db1.transaction(['planningUnit'], 'readwrite');
        var planningunitOsAll = planningUnitTransactionAll.objectStore('planningUnit');
        var planningunitRequestAll = planningunitOsAll.getAll();
        var planningUnitListAll = []
        planningunitRequestAll.onerror = function (event) {
          this.setState({
            message: i18n.t('static.program.errortext'),
            color: 'red'
          })
        }.bind(this);
        planningunitRequestAll.onsuccess = function (e) {
          // var myResultAll = [];
          planningUnitListAll = planningunitRequestAll.result;
          // console.log("myResult", myResult);
          // alert((document.getElementById("programId").value).split("_")[0]);
          var programId = (document.getElementById("programId").value).split("_")[0];
          // console.log('programId----->>>', programId)
          // console.log(myResult);
          var proList = []
          for (var i = 0; i < myResult.length; i++) {
            var pu = planningUnitListAll.filter(c => c.planningUnitId == myResult[i].planningUnit.id)[0];

            if (myResult[i].program.id == programId && myResult[i].active == true && pu.active == true) {
              var productJson = {
                name: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                id: myResult[i].planningUnit.id
              }
              proList[i] = productJson
            }
          }
          // console.log("planningUnitList---" + proList);
          this.setState({
            planningUnitList: proList
          })

          var programId = document.getElementById('programId').value;
          // alert(programId);
          this.setState({ programId: programId });
          var db1;
          getDatabase();
          var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
          var regionList = []
          openRequest.onerror = function (event) {
            this.setState({
              message: i18n.t('static.program.errortext'),
              color: 'red'
            })
          }.bind(this);
          openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
              this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
              })
            }.bind(this);
            programRequest.onsuccess = function (event) {
              var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
              var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
              var programJson = JSON.parse(programData);


              for (var i = 0; i < programJson.regionList.length; i++) {
                var regionJson = {
                  // name: // programJson.regionList[i].regionId,
                  name: getLabelText(programJson.regionList[i].label, this.state.lang),
                  id: programJson.regionList[i].regionId
                }
                regionList.push(regionJson);

              }
              // console.log("regionList---->", regionList);
              this.setState({
                regionList: regionList
              })
            }.bind(this);
          }.bind(this);
        }.bind(this);
      }.bind(this);
    }.bind(this)
  }

  addProblem() {
    // alert("hi");


    var programId = document.getElementById("programId").value;
    var regionId = document.getElementById("regionId").value;
    var planningUnitId = document.getElementById("planningUnitId").value;
    var problemId = document.getElementById("problemId").value;
    var problemActionIndex = 0;

    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    var regionList = []
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: 'red'
      },
        () => {
          this.hideSecondComponent();
        })
    }.bind(this);
    openRequest.onsuccess = function (e) {

      db1 = e.target.result;
      var transaction = db1.transaction(['programData'], 'readwrite');
      var programTransaction = transaction.objectStore('programData');
      var programRequest = programTransaction.get(programId);
      var programRequestList = "";

      programRequest.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: 'red'
        },
          () => {
            this.hideSecondComponent();
          })
      }.bind(this);
      programRequest.onsuccess = function (event) {

        programRequestList = programRequest.result;

        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);

        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
        let username = decryptedUser.username;

        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
        var programJson = JSON.parse(programData);
        // console.log("programJson===>", programJson);

        var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
        var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
        var planningunitRequest = planningunitOs.getAll();
        var planningUnitList = []
        planningunitRequest.onerror = function (event) {
          this.setState({
            supplyPlanError: i18n.t('static.program.errortext')
          },
            () => {
              this.hideSecondComponent();
            })
        }.bind(this);
        planningunitRequest.onsuccess = function (e) {
          var planningUnitResult = [];
          planningUnitResult = planningunitRequest.result;
          planningUnitList = planningUnitResult.filter(c => c.program.id == programId.split("_")[0]);
          // console.log("planing Unit List===>", planningUnitList);
          var regionList = programJson.regionList;
          // console.log("regionList===>", regionList);

          var transactionP = db1.transaction(['problem'], 'readwrite');
          var problem = transactionP.objectStore('problem');
          var getRequestP = problem.getAll();
          getRequestP.onerror = function (event) {
            this.setState({
              message: i18n.t('static.program.errortext'),
              color: 'red'
            },
              () => {
                this.hideSecondComponent();
              })
          }.bind(this);
          getRequestP.onsuccess = function (event) {
            var probList = [];
            probList = getRequestP.result;
            // console.log("problemList====>", probList);
            var programObj = programJson;
            var planningUnitObj = planningUnitList.filter(c => c.planningUnit.id == planningUnitId)[0];
            var regionObj = { id: 0 };
            if (regionId != 0 && regionId != "") {
              regionObj = regionList.filter(c => c.regionId == regionId)[0];
            } else {
              regionObj = regionObj;
            }
            var problemObj = probList.filter(c => c.problem.problemId == problemId)[0];
            var problemActionList = programJson.problemReportList;

            if (problemId == 13) {
              // console.log("programObj====>", programObj);
              // console.log("planningUnitObj====>", planningUnitObj);
              // console.log("regionObj====>", regionObj);
              // console.log("problemObj====>", problemObj);
              // console.log("problemActionList====>", problemActionList);
              problemActionIndex = problemActionList.length;

              var index = problemActionList.findIndex(
                c => c.program.id == programObj.programId
                  && c.planningUnit.id == planningUnitObj.planningUnit.id
                  && c.realmProblem.problem.problemId == 13);

              if (index == -1) {
                var curDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss')));
                var json = {
                  problemReportId: 0,
                  program: {
                    id: programObj.programId,
                    label: programObj.label,
                    code: programObj.programCode
                  },
                  versionId: programObj.currentVersion.versionId,
                  realmProblem: problemObj,

                  dt: '',
                  region: regionObj,
                  planningUnit: {
                    id: planningUnitObj.planningUnit.id,
                    label: planningUnitObj.planningUnit.label,

                  },
                  shipmentId: '',
                  data5: '',

                  problemActionIndex: problemActionIndex,

                  index: '',
                  problemCategory: {
                    id: 1,
                    label: { label_en: 'Data Quality' }
                  },
                  problemStatus: {
                    id: 1,
                    label: { label_en: 'Open' }
                  },
                  problemType: {
                    id: 2,
                    label: {
                      label_en: 'Manual'
                    }
                  },
                  reviewed: false,
                  reviewNotes: '',
                  reviewedDate: '',
                  createdBy: {
                    userId: userId,
                    username: username
                  },
                  createdDate: curDate,
                  lastModifiedBy: {
                    userId: userId,
                    username: username
                  },
                  lastModifiedDate: curDate,
                  problemTransList: [
                    {
                      problemReportTransId: '',
                      problemStatus: {
                        id: 1,
                        label: {
                          active: true,
                          labelId: 461,
                          label_en: "Open",
                          label_sp: null,
                          label_fr: null,
                          label_pr: null
                        }
                      },
                      notes: document.getElementById('notes').value,
                      reviewed: false,
                      createdBy: {
                        userId: userId,
                        username: username
                      },
                      createdDate: curDate
                    }
                  ]

                }
                problemActionList.push(json);
                // console.log("problemActionList===>", problemActionList);


                var problemTransaction = db1.transaction(['programData'], 'readwrite');
                var problemOs = problemTransaction.objectStore('programData');
                var paList = problemActionList.filter(c => c.program.id == programObj.programId)
                programObj.problemReportList = paList;
                programRequestList.programData.generalData = (CryptoJS.AES.encrypt(JSON.stringify(programObj), SECRET_KEY)).toString();
                var putRequest = problemOs.put(programRequestList);
                putRequest.onerror = function (event) {
                  this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                  },
                    () => {
                      this.hideSecondComponent();
                    })
                }.bind(this);
                putRequest.onsuccess = function (event) {
                  var programId = document.getElementById("programId").value;
                  this.props.history.push(`/report/problemList/` + programId + '/' + false + '/green/' + i18n.t('static.problem.addedSuccessfully'));

                }.bind(this);


              } else {
                this.props.history.push(`/report/addProblem/` + 'red/' + i18n.t('static.problem.allreadyExist'));
                this.hideSecondComponent();
                // console.log("in else============>");

              }

            }

          }.bind(this);
        }.bind(this)
      }.bind(this);
    }.bind(this);


  }

  render() {
    const lan = 'en';
    const { programList } = this.state;
    let programs = programList.length > 0
      && programList.map((item, i) => {
        return (
          <option key={i} value={item.id}>{item.name}</option>
        )
      }, this);


    const { planningUnitList } = this.state;
    let planningUnits = planningUnitList.length > 0
      && planningUnitList.map((item, i) => {
        return (
          <option key={i} value={item.id}>{item.name}</option>
        )
      }, this);

    const { regionList } = this.state;
    let regions = regionList.length > 0
      && regionList.map((item, i) => {
        return (
          <option key={i} value={item.id}>{item.name}</option>
        )
      }, this);

    const { problemList } = this.state;
    let problems = problemList.length > 0
      && problemList.map((item, i) => {
        return (
          <option key={i} value={item.problem.problemId}>{getLabelText(item.problem.label, this.state.lang)}</option>
        )
      }, this);

    return (
      <div className="animated fadeIn">
        <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
        <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <Row>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              <Formik
                initialValues={initialValues}
                validate={validate(validationSchema)}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  this.addProblem && this.addProblem();
                  // this.props.history.push(`/report/problemList/` + 'green/' + i18n.t('static.problem.addedSuccessfully'))
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
                    handleReset,
                    setFieldValue,
                  }) => (
                      <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='roleForm'>
                        <CardBody className="pt-2 pb-0">
                          <FormGroup>
                            <Label for="programCode">{i18n.t('static.program.program')}<span className="red Reqasterisk">*</span></Label>
                            <Input
                              type="select"
                              name="programId"
                              id="programId"
                              bsSize="sm"
                              valid={!errors.programId}
                              invalid={touched.programId && !!errors.programId}
                              onChange={(e) => { handleChange(e); this.getPlanningUnitList() }}
                              onBlur={handleBlur}
                              required
                            // value={this.state.budget.program.id}
                            >
                              <option value="">{i18n.t('static.common.select')}</option>
                              {programs}
                            </Input>

                            <FormFeedback className="red">{errors.programId}</FormFeedback>
                          </FormGroup>
                          <FormGroup>
                            <Label for="programCode">{i18n.t('static.planningunit.planningunit')}<span className="red Reqasterisk">*</span></Label>
                            <Input
                              type="select"
                              name="planningUnitId"
                              id="planningUnitId"
                              bsSize="sm"
                              valid={!errors.planningUnitId}
                              invalid={touched.planningUnitId && !!errors.planningUnitId}
                              onChange={(e) => { handleChange(e) }}
                              onBlur={handleBlur}
                              required
                            >
                              <option value="">{i18n.t('static.common.select')}</option>
                              {planningUnits}
                            </Input>
                            <FormFeedback className="red">{errors.planningUnitId}</FormFeedback>
                          </FormGroup>
                          <FormGroup>
                            <Label>{i18n.t('static.region.region')}</Label>
                            <Input type="select"
                              bsSize="sm"
                              name="regionId"
                              id="regionId"

                            >
                              <option value="0">{i18n.t('static.common.select')}</option>
                              {regions}
                            </Input>
                            <FormFeedback className="red">{errors.createdDate}</FormFeedback>
                          </FormGroup>
                          <FormGroup>
                            <Label>{i18n.t('static.report.problem')} <span className="red Reqasterisk">*</span></Label>
                            <Input type="select"
                              bsSize="sm"
                              name="problemId"
                              id="problemId"
                              valid={!errors.problemId}
                              invalid={touched.problemId && !!errors.problemId}
                              onChange={(e) => { handleChange(e) }}
                              onBlur={handleBlur}
                              required
                            >
                              <option value="">{i18n.t('static.common.select')}</option>
                              {problems}
                            </Input>
                            <FormFeedback className="red">{errors.problemId}</FormFeedback>
                          </FormGroup>
                          <FormGroup>
                            <Label>{i18n.t('static.common.notes')}</Label>
                            <Input type="textarea"
                              // maxLength={600}
                              bsSize="sm"
                              name="notes"
                              id="notes"
                            // valid={!errors.problemId}
                            // invalid={touched.problemId && !!errors.problemId}
                            // onChange={(e) => { handleChange(e) }}
                            // onBlur={handleBlur}
                            // required
                            >
                            </Input>
                          </FormGroup>
                        </CardBody>
                        <CardFooter>
                          <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

                            &nbsp;
                          </FormGroup>
                        </CardFooter>
                      </Form>
                    )} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
  cancelClicked() {
    this.props.history.push(`/report/problemList/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
  }

  resetClicked() {
    let { role } = this.state;
    role.label.label_en = '';
    this.state.businessFunctionId = '';
    this.state.canCreateRoleId = '';

    this.setState(
      {
        role
      }
    )

  }
}

export default AddRoleComponent;
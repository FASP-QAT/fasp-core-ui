// import React, { Component } from "react";
// import {
//     Card, CardBody, CardHeader,
//     Label, Input, FormGroup,
//     CardFooter, Button, Table, Col, Row, FormFeedback, Form

// } from 'reactstrap';
// import { Date } from 'core-js';
// import { Formik } from 'formik';
// import * as Yup from 'yup'
// import i18n from '../../i18n'
// import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
// import getLabelText from '../../CommonComponent/getLabelText';
// import SupplierService from "../../api/SupplierService";
// import AuthenticationService from "../Common/AuthenticationService";
// import PlanningUnitService from "../../api/PlanningUnitService";
// import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
// import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature'
// let initialValues = {
//     startDate: '',
//     stopDate: '',
//     supplier: [],
//     capacity: ''

// }
// const entityname = i18n.t('static.dashboad.planningunitcapacity')
// const validationSchema = function (values, t) {
//     return Yup.object().shape({
//         supplier: Yup.string()
//             .required(i18n.t('static.planningunit.suppliertext')),
//         capacity: Yup.number()
//             .required(i18n.t('static.planningunit.capacitytext')).min(0, i18n.t('static.program.validvaluetext')),
//         startDate: Yup.string()
//             .required(i18n.t('static.budget.startdatetext')),
//         stopDate: Yup.string()
//             .required(i18n.t('static.budget.stopdatetext'))
//     })
// }

// const validate = (getValidationSchema) => {
//     return (values) => {
//         const validationSchema = getValidationSchema(values, i18n.t)
//         try {
//             validationSchema.validateSync(values, { abortEarly: false })
//             return {}
//         } catch (error) {
//             return getErrorsFromValidationError(error)
//         }
//     }
// }

// const getErrorsFromValidationError = (validationError) => {
//     const FIRST_ERROR = 0
//     return validationError.inner.reduce((errors, error) => {
//         return {
//             ...errors,
//             [error.path]: error.errors[FIRST_ERROR],
//         }
//     }, {})
// }

// class PlanningUnitCapacity extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             lang: localStorage.getItem('lang'),
//             planningUnitCapacity: {},
//             planningUnitCapacityId: '',
//             suppliers: [],
//             supplier: {
//                 supplierId: '',
//                 label: {
//                     label_en: ''
//                 }
//             }, supplierName: '',
//             capacity: '',
//             startDate: '',
//             stopDate: '',
//             rows: [],
//             planningUnit: {
//                 planningUnitId: '',
//                 label: {
//                     label_en: ''
//                 }
//             }, isNew: true,
//             updateRowStatus: 0
//         }
//         this.currentDate = this.currentDate.bind(this);
//         this.setTextAndValue = this.setTextAndValue.bind(this);
//         this.deleteLastRow = this.deleteLastRow.bind(this);
//         this.disableRow = this.disableRow.bind(this);
//         this.submitForm = this.submitForm.bind(this);
//         this.enableRow = this.enableRow.bind(this);
//         this.cancelClicked = this.cancelClicked.bind(this);
//         this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
//         this.updateRow = this.updateRow.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
//     }
//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }

//     updateRow(idx) {
//         if (this.state.updateRowStatus == 1) {
//             this.setState({ rowErrorMessage: 'One Of the mapped row is already in update.' })
//         } else {
//             console.log(JSON.stringify(this.state.rows[idx]))
//             initialValues = {
//                 planningUnitCapacityId: this.state.rows[idx].planningUnitCapacityId,
//                 supplierId: this.state.rows[idx].supplier.id,
//                 supplier: {
//                     supplierId: this.state.rows[idx].supplier.id,
//                     label: {
//                         label_en: this.state.rows[idx].supplier.label.label_en
//                     }
//                 },
//                 startDate: this.state.rows[idx].startDate,
//                 stopDate: this.state.rows[idx].stopDate,
//                 gtin: this.state.rows[idx].gtin,
//                 capacity: this.state.rows[idx].capacity
//             }
//             const rows = [...this.state.rows]
//             this.setState({
//                 planningUnitCapacityId: this.state.rows[idx].planningUnitCapacityId,
//                 supplierId: this.state.rows[idx].supplier.id,
//                 supplier: {
//                     supplierId: this.state.rows[idx].supplier.id,
//                     label: {
//                         label_en: this.state.rows[idx].supplier.label.label_en
//                     }
//                 },
//                 startDate: this.state.rows[idx].startDate,
//                 stopDate: this.state.rows[idx].stopDate,
//                 gtin: this.state.rows[idx].gtin,
//                 capacity: this.state.rows[idx].capacity,
//                 isNew: false,
//                 updateRowStatus: 1
//             }
//             );

//             rows.splice(idx, 1);
//             this.setState({ rows });
//         }
//     }





//     currentDate() {
//         var todaysDate = new Date();
//         var yyyy = todaysDate.getFullYear().toString();
//         var mm = (todaysDate.getMonth() + 1).toString();
//         var dd = todaysDate.getDate().toString();
//         var mmChars = mm.split('');
//         var ddChars = dd.split('');
//         let date = yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
//         // console.log("------date", date)
//         return date;
//     }
//     touchAll(setTouched, errors) {
//         setTouched({
//             supplier: true,
//             startDate: true,
//             stopDate: true,
//             capacity: true,

//         }
//         )
//         this.validateForm(errors)
//     }
//     validateForm(errors) {
//         this.findFirstError('capacityForm', (fieldName) => {
//             return Boolean(errors[fieldName])
//         })
//     }
//     findFirstError(formName, hasError) {
//         const form = document.forms[formName]

//         for (let i = 0; i < form.length; i++) {
//             if (hasError(form[i].name)) {
//                 form[i].focus()
//                 break
//             }
//         }
//     }

//     setTextAndValue = (event) => {
//         // let { budget } = this.state;
//         console.log(event.target.name, event.target.value)
//         if (event.target.name === "supplier") {
//             this.state.supplier.supplierId = event.target.value;
//             this.state.supplier.label.label_en = event.target[event.target.selectedIndex].text;
//         }
//         if (event.target.name === "capacity") {
//             this.state.capacity = event.target.value;
//         }
//         if (event.target.name === "startDate") {
//             this.state.startDate = event.target.value;

//         }
//         if (event.target.name === "stopDate") {
//             this.state.stopDate = event.target.value;
//         }
//         console.log(JSON.stringify(this.state.supplier))

//     }


//     deleteLastRow() {
//         const rows = [...this.state.rows]
//         /*  rows[this.state.rows.length - 1].active=false
//           var row=   rows.slice(-1).pop();
//           rows.push(row);*/
//         this.setState({
//             rows
//         });
//     }
//     disableRow(idx) {
//         const rows = [...this.state.rows]
//         rows[idx].active = false
//         // rows.splice(idx, 1);
//         this.setState({ rows })
//     }
//     handleRemoveSpecificRow(idx) {
//         const rows = [...this.state.rows]
//         rows.splice(idx, 1);
//         this.setState({ rows })
//     }
//     enableRow(idx) {
//         const rows = [...this.state.rows]
//         rows[idx].active = true
//         // rows.splice(idx, 1);
//         this.setState({ rows })
//     }

//     submitForm() {
//         console.log(JSON.stringify(this.state))
//         var planningUnitCapacity = this.state.rows
//         console.log("planningUnitCapacity------",planningUnitCapacity);


//         AuthenticationService.setupAxiosInterceptors();
//         PlanningUnitService.editPlanningUnitCapacity(planningUnitCapacity)
//             .then(response => {
//                 if (response.status == 200) {
//                     this.props.history.push(`/planningUnit/listPlanningUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))

//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }

//             }).catch(
//                 error => {
//                     if (error.message === "Network Error") {
//                         this.setState({ message: error.message });
//                     } else {
//                         switch (error.response ? error.response.status : "") {
//                             case 500:
//                             case 401:
//                             case 404:
//                             case 406:
//                             case 412:
//                                 this.setState({ message: error.response.messageCode });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 break;
//                         }
//                     }
//                 }
//             );



//     }
//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         PlanningUnitService.getPlanningUnitById(this.props.match.params.planningUnitId).then(response => {
//             if (response.status == 200) {
//                 console.log(response.data);
//                 this.setState({
//                     planningUnit: response.data,
//                     //  rows:response.data
//                 })
//             }
//             else {
//                 this.setState({
//                     message: response.data.messageCode
//                 },
//                     () => {
//                         this.hideSecondComponent();
//                     })
//             }

//         }).catch(
//             error => {
//                 console.log(JSON.stringify(error))
//                 if (error.message === "Network Error") {
//                     this.setState({ message: error.message });
//                 } else {
//                     switch (error.response ? error.response.status : "") {
//                         case 500:
//                         case 401:
//                         case 404:
//                         case 406:
//                         case 412:
//                             this.setState({ message: error.response.messageCode });
//                             break;
//                         default:
//                             this.setState({ message: 'static.unkownError' });
//                             console.log("Error code unkown");
//                             break;
//                     }
//                 }
//             }
//         );
//         PlanningUnitService.getPlanningUnitCapacityForId(this.props.match.params.planningUnitId).then(response => {
//             if (response.status == 200) {
//                 console.log(response.data);
//                 this.setState({
//                     planningUnitCapacity: response.data,
//                     rows: response.data
//                 })
//             } else {
//                 this.setState({
//                     message: response.data.messageCode
//                 },
//                     () => {
//                         this.hideSecondComponent();
//                     })
//             }

//         }).catch(
//             error => {
//                 if (error.message === "Network Error") {
//                     this.setState({ message: error.message });
//                 } else {
//                     switch (error.response ? error.response.status : "") {
//                         case 500:
//                         case 401:
//                         case 404:
//                         case 406:
//                         case 412:
//                             this.setState({ message: error.response.data.messageCode });
//                             break;
//                         default:
//                             this.setState({ message: 'static.unkownError' });
//                             console.log("Error code unkown");
//                             break;
//                     }
//                 }
//             }
//         );
//         SupplierService.getSupplierListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     console.log(response.data)
//                     this.setState({
//                         suppliers: response.data
//                     })
//                 }else {
//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }

//             }).catch(
//                 error => {
//                     if (error.message === "Network Error") {
//                         this.setState({ message: error.message });
//                     } else {
//                         switch (error.response.status) {
//                             case 500:
//                             case 401:
//                             case 404:
//                             case 406:
//                             case 412:
//                                 this.setState({ message: error.response.messageCode });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 break;
//                         }
//                     }
//                 }
//             );

//     }
//     render() {
//         const { suppliers } = this.state;
//         let supplierList = suppliers.length > 0 && suppliers.map((item, i) => {
//             return (
//                 <option key={i} value={item.supplierId}>
//                     {getLabelText(item.label, this.state.lang)}
//                 </option>
//             )
//         }, this);
//         return (<div className="animated fadeIn">
//             <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
//             <Row>
//                 <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
//                     <Card>
//                         <CardHeader>
//                             <strong>{i18n.t('static.dashboad.planningunitcapacity')}</strong>
//                         </CardHeader>
//                         <CardBody>
//                             <Formik
//                                 enableReinitialize={true}
//                                 initialValues={initialValues}
//                                 validate={validate(validationSchema)}
//                                 onSubmit={(values, { setSubmitting, setErrors, resetForm }) => {
//                                     if (this.state.supplier.supplierId != "" && this.state.startDate != "" && this.state.stopDate != "" && this.state.capacity != "") {
//                                         var json =
//                                         {
//                                             planningUnitCapacityId: this.state.planningUnitCapacityId,
//                                             planningUnit: {
//                                                 id: this.props.match.params.planningUnitId
//                                             }
//                                             ,
//                                             supplier: {
//                                                 id: this.state.supplier.supplierId,
//                                                 label: {
//                                                     label_en: this.state.supplier.label.label_en
//                                                 }
//                                             }
//                                             ,
//                                             startDate: this.state.startDate,

//                                             stopDate: this.state.stopDate,

//                                             capacity: this.state.capacity,
//                                             isNew: this.state.isNew,
//                                             active: true

//                                         }
//                                         this.state.rows.push(json)
//                                         this.setState({ rows: this.state.rows, updateRowStatus: 0 })
//                                         this.setState({
//                                             planningUnitCapacityId: '',

//                                             supplier: {
//                                                 supplierId: '',
//                                                 label: {
//                                                     label_en: ''
//                                                 }
//                                             }
//                                             ,
//                                             startDate: '',

//                                             stopDate: '',

//                                             capacity: '',
//                                             active: true


//                                         });
//                                     }
//                                     resetForm({
//                                         planningUnitCapacityId: '',
//                                         planningUnit: {
//                                             id: this.props.match.params.planningUnitId
//                                         }
//                                         ,
//                                         supplier: {
//                                             supplierId: '',
//                                             label: {
//                                                 label_en: ''
//                                             }
//                                         }
//                                         ,
//                                         startDate: '',

//                                         stopDate: '',

//                                         capacity: '',
//                                         active: true


//                                     });

//                                 }}
//                                 render={
//                                     ({
//                                         values,
//                                         errors,
//                                         touched,
//                                         handleChange,
//                                         handleBlur,
//                                         handleSubmit,
//                                         isSubmitting,
//                                         isValid,
//                                         setTouched
//                                     }) => (<Form onSubmit={handleSubmit} noValidate name='capacityForm'>
//                                         <Row>
//                                             <FormGroup className="col-md-6">
//                                                 <Label htmlFor="select">{i18n.t('static.planningunit.planningunit')}</Label>
//                                                 <Input
//                                                     type="text"
//                                                     name="planningUnitId"
//                                                     id="progplanningUnitIdramId"
//                                                     bsSize="sm"
//                                                     readOnly
//                                                     valid={!errors.planningUnitId && this.state.planningUnit.label != ''}
//                                                     invalid={touched.planningUnitId && !!errors.planningUnitId}
//                                                     onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
//                                                     onBlur={handleBlur}

//                                                     value={getLabelText(this.state.planningUnit.label, this.state.lang)}
//                                                 >
//                                                 </Input>
//                                             </FormGroup>
//                                             <FormGroup className="col-md-6">
//                                                 <Label htmlFor="select">{i18n.t('static.supplier.supplier')}</Label>
//                                                 <Input type="select" name="supplier" id="supplier" bsSize="sm"
//                                                     valid={!errors.supplier && this.state.supplier.supplierId != ''}
//                                                     invalid={touched.realmId && !!errors.supplier}
//                                                     onBlur={handleBlur}
//                                                     onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
//                                                     value={this.state.supplier.supplierId} required>
//                                                     <option value="">{i18n.t('static.common.select')}</option>
//                                                     {supplierList}
//                                                 </Input> <FormFeedback className="red">{errors.supplier}</FormFeedback>
//                                             </FormGroup>
//                                             <FormGroup className="col-md-6">
//                                                 <Label for="startDate">{i18n.t('static.common.startdate')}</Label>
//                                                 <Input
//                                                     className="fa fa-calendar Fa-right"
//                                                     name="startDate"
//                                                     id="startDate"
//                                                     type="date"
//                                                     bsSize="sm"
//                                                     valid={!errors.startDate && this.state.startDate != ''}
//                                                     invalid={touched.startDate && !!errors.startDate}
//                                                     onBlur={handleBlur}
//                                                     min={this.currentDate()}
//                                                     onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
//                                                     value={this.state.startDate}
//                                                     // placeholder={i18n.t('static.budget.budgetstartdate')}
//                                                     required />
//                                                 <FormFeedback className="red">{errors.startDate}</FormFeedback>
//                                             </FormGroup>
//                                             <FormGroup className="col-md-6">
//                                                 <Label for="stopDate">{i18n.t('static.common.stopdate')}</Label>
//                                                 <Input

//                                                     className="fa fa-calendar Fa-right"
//                                                     name="stopDate"
//                                                     id="stopDate"
//                                                     bsSize="sm"
//                                                     type="date"
//                                                     valid={!errors.stopDate && this.state.stopDate != ''}
//                                                     invalid={touched.stopDate && !!errors.stopDate}
//                                                     onBlur={handleBlur}
//                                                     min={this.state.startDate}
//                                                     onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
//                                                     value={this.state.stopDate}
//                                                     // placeholder={i18n.t('static.budget.budgetstopdate')}
//                                                     required /> <FormFeedback className="red">{errors.stopDate}</FormFeedback>

//                                             </FormGroup>
//                                             <FormGroup className="col-md-6">
//                                                 <Label for="capacity">{i18n.t('static.planningunit.capacity')}</Label>
//                                                 <Input

//                                                     type="number"
//                                                     min="0"
//                                                     name="capacity"
//                                                     id="capacity"
//                                                     bsSize="sm"
//                                                     valid={!errors.capacity && this.state.capacity != ''}
//                                                     invalid={touched.capacity && !!errors.capacity}
//                                                     onBlur={handleBlur}
//                                                     onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
//                                                     value={this.state.capacity}
//                                                     type="number"
//                                                     // placeholder={i18n.t('static.planningunit.capacitytext')}
//                                                     required />
//                                                 <FormFeedback className="red">{errors.capacity}</FormFeedback>
//                                             </FormGroup>

//                                             <FormGroup className="col-md-6 mt-md-4" >
//                                                 {/* <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> {i18n.t('static.common.rmlastrow')}</Button>*/}
//                                                 <Button type="submit" size="sm" color="success" onClick={() => this.touchAll(setTouched, errors)} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
//                                                 &nbsp;


//                 </FormGroup></Row></Form>)} />

//                             <h5 className="red">{this.state.rowErrorMessage}</h5>

//                             <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

//                                 <thead>
//                                     <tr>
//                                         <th className="text-center"> {i18n.t('static.supplier.supplier')} </th>
//                                         <th className="text-center"> {i18n.t('static.common.startdate')}</th>
//                                         <th className="text-center"> {i18n.t('static.common.stopdate')} </th>
//                                         <th className="text-center">{i18n.t('static.planningunit.capacity')}</th>
//                                         <th className="text-center">{i18n.t('static.common.status')}</th>
//                                         <th className="text-center">{i18n.t('static.common.action')}</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {
//                                         this.state.rows.length > 0
//                                         &&
//                                         this.state.rows.map((item, idx) =>
//                                             <tr id="addr0" key={idx} >
//                                                 <td>
//                                                     {this.state.rows[idx].supplier.label.label_en}
//                                                 </td>
//                                                 <td>

//                                                     {this.state.rows[idx].startDate}
//                                                 </td>
//                                                 <td>
//                                                     {this.state.rows[idx].stopDate}
//                                                 </td>
//                                                 <td>
//                                                     {this.state.rows[idx].capacity}
//                                                 </td>
//                                                 <td>
//                                                     {this.state.rows[idx].active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')}
//                                                 </td>
//                                                 <td>
//                                                     {/* <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} /> */}
//                                                     <StatusUpdateButtonFeature removeRow={this.handleRemoveSpecificRow} enableRow={this.enableRow} disableRow={this.disableRow} rowId={idx} status={this.state.rows[idx].active} isRowNew={this.state.rows[idx].isNew} />

//                                                     <UpdateButtonFeature updateRow={this.updateRow} rowId={idx} isRowNew={this.state.rows[idx].isNew} />
//                                                 </td>
//                                             </tr>)

//                                     }
//                                 </tbody>

//                             </Table>
//                         </CardBody>
//                         <CardFooter>
//                             <FormGroup>
//                                 <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
//                                 {/*this.state.rows.length > 0 &&*/ <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
//                                 &nbsp;
//                         </FormGroup>

//                         </CardFooter>
//                     </Card>
//                 </Col>
//             </Row>
//         </div>

//         );
//     }
//     cancelClicked() {
//         this.props.history.push(`/planningUnit/listPlanningUnit/`+ 'red/' + i18n.t('static.message.cancelled', { entityname }))
//     }
// }

// export default PlanningUnitCapacity

//MyPage

import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form

} from 'reactstrap';
import { Date } from 'core-js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
import getLabelText from '../../CommonComponent/getLabelText';
import SupplierService from "../../api/SupplierService";
import AuthenticationService from "../Common/AuthenticationService";
import PlanningUnitService from "../../api/PlanningUnitService";
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import moment from "moment";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { JEXCEL_DECIMAL_NO_REGEX, JEXCEL_DATE_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";

let initialValues = {
    startDate: '',
    stopDate: '',
    supplier: [],
    capacity: ''

}
const entityname = i18n.t('static.dashboad.planningunitcapacity')
// const validationSchema = function (values, t) {
//     return Yup.object().shape({
//         supplier: Yup.string()
//             .required(i18n.t('static.planningunit.suppliertext')),
//         capacity: Yup.number()
//             .required(i18n.t('static.planningunit.capacitytext')).min(0, i18n.t('static.program.validvaluetext')),
//         startDate: Yup.string()
//             .required(i18n.t('static.budget.startdatetext')),
//         stopDate: Yup.string()
//             .required(i18n.t('static.budget.stopdatetext'))
//     })
// }

class PlanningUnitCapacity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            lang: localStorage.getItem('lang'),
            planningUnitCapacity: {},
            planningUnitCapacityId: '',
            suppliers: [],
            supplier: {
                supplierId: '',
                label: {
                    label_en: ''
                }
            }, supplierName: '',
            capacity: '',
            startDate: '',
            stopDate: '',
            rows: [],
            planningUnit: {
                planningUnitId: '',
                label: {
                    label_en: ''
                }
            }, isNew: true,
            updateRowStatus: 0
        }
        this.currentDate = this.currentDate.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.addRow = this.addRow.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    currentDate() {
        var todaysDate = new Date();
        var yyyy = todaysDate.getFullYear().toString();
        var mm = (todaysDate.getMonth() + 1).toString();
        var dd = todaysDate.getDate().toString();
        var mmChars = mm.split('');
        var ddChars = dd.split('');
        let date = yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
        // console.log("------date", date)
        return date;
    }

    submitForm() {
        var validation = this.checkValidation();
        console.log("validation************", validation);
        if (validation) {
            // var tableJson = this.el.getJson();
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var rd = this.el.getRowData(i);
                var map1 = new Map(Object.entries(rd));
                if (parseInt(map1.get("7")) === 1) {
                    let json = {
                        planningUnitCapacityId: parseInt(map1.get("6")),
                        planningUnit: {
                            id: this.props.match.params.planningUnitId
                        }
                        ,
                        supplier: {
                            id: parseInt(map1.get("1")),
                            // label: {
                            //     label_en: this.state.supplier.label.label_en
                            // }
                        }
                        ,
                        startDate: moment(map1.get("2")).format("YYYY-MM-DD"),

                        stopDate: moment(map1.get("3")).format("YYYY-MM-DD"),
                        capacity: this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        active: map1.get("5"),
                    }
                    changedpapuList.push(json);
                }
            }
            console.log("changedpapuList----->", changedpapuList);
            // AuthenticationService.setupAxiosInterceptors();
            PlanningUnitService.editPlanningUnitCapacity(changedpapuList)
                .then(response => {
                    if (response.status == 200) {
                        this.props.history.push(`/planningUnit/listPlanningUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))

                    } else {
                        this.setState({
                            message: response.data.messageCode
                        },
                            () => {
                                this.hideSecondComponent();
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

        } else {
            console.log("Something went wrong");
        }



    }

    filterSupplier = function (instance, cell, c, r, source) {
        return this.state.supplierList.filter(c => c.active.toString() == "true");
    }.bind(this);

    buildJExcel() {
        const { suppliers } = this.state;
        let supplierList = [];
        if (suppliers.length > 0) {
            for (var i = 0; i < suppliers.length; i++) {
                var paJson = {
                    name: getLabelText(suppliers[i].label, this.state.lang),
                    id: parseInt(suppliers[i].supplierId),
                    active: suppliers[i].active
                }
                supplierList[i] = paJson
            }
        }

        this.setState({
            supplierList: supplierList
        })

        var papuList = this.state.rows;
        var data = [];
        var papuDataArr = []

        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {


                data = [];
                data[0] = getLabelText(this.state.planningUnit.label, this.state.lang);
                data[1] = parseInt(papuList[j].supplier.id);
                data[2] = papuList[j].startDate;
                data[3] = papuList[j].stopDate;
                data[4] = papuList[j].capacity;
                data[5] = papuList[j].active;
                data[6] = papuList[j].planningUnitCapacityId;
                data[7] = 0;
                papuDataArr[count] = data;
                count++;


            }
        }

        // console.log("inventory Data Array-->", papuDataArr);
        if (papuDataArr.length == 0) {
            data = [];
            // data[0] = getLabelText(this.state.planningUnit.label, this.state.lang);
            // data[5] = true;

            data[0] = getLabelText(this.state.planningUnit.label, this.state.lang);
            data[1] = "";
            data[2] = "";
            data[3] = "";
            data[4] = "";
            data[5] = true;
            data[6] = 0;
            data[7] = 1;

            papuDataArr[0] = data;
        }
        this.el = jexcel(document.getElementById("paputableDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("paputableDiv"), true);

        var json = [];
        var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            columns: [

                {
                    title: i18n.t('static.dashboard.planningunit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.supplier'),
                    type: 'autocomplete',
                    source: supplierList,
                    filter: this.filterSupplier

                },
                {
                    title: i18n.t('static.common.startdate'),
                    type: 'calendar',
                    options: {
                        format: JEXCEL_DATE_FORMAT
                    }

                },
                {
                    title: i18n.t('static.common.stopdate'),
                    type: 'calendar',
                    options: {
                        format: JEXCEL_DATE_FORMAT
                    }
                },
                {
                    title: i18n.t('static.planningunit.capacity'),
                    type: 'numeric',
                    // decimal:'.',
                    mask: '#,##.00',
                    textEditor: true,
                    disabledMaskOnEdition: true
                },
                {
                    title: i18n.t('static.common.status'),
                    type: 'checkbox'
                },
                {
                    title: 'planningUnitId',
                    type: 'hidden'
                },
                {
                    title: 'isChange',
                    type: 'hidden'
                }

            ],
            editbale: true,
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            // tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            parseFormulas: true,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            onchange: this.changed,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            onpaste: this.onPaste,
            oneditionend: this.oneditionend,
            // text: {
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            onload: this.loaded,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                //Add consumption batch info


                if (y == null) {
                    // Insert a new column
                    if (obj.options.allowInsertColumn == true) {
                        items.push({
                            title: obj.options.text.insertANewColumnBefore,
                            onclick: function () {
                                obj.insertColumn(1, parseInt(x), 1);
                            }
                        });
                    }

                    if (obj.options.allowInsertColumn == true) {
                        items.push({
                            title: obj.options.text.insertANewColumnAfter,
                            onclick: function () {
                                obj.insertColumn(1, parseInt(x), 0);
                            }
                        });
                    }

                    // Delete a column
                    // if (obj.options.allowDeleteColumn == true) {
                    //     items.push({
                    //         title: obj.options.text.deleteSelectedColumns,
                    //         onclick: function () {
                    //             obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                    //         }
                    //     });
                    // }

                    // Rename column
                    // if (obj.options.allowRenameColumn == true) {
                    //     items.push({
                    //         title: obj.options.text.renameThisColumn,
                    //         onclick: function () {
                    //             obj.setHeader(x);
                    //         }
                    //     });
                    // }

                    // Sorting
                    if (obj.options.columnSorting == true) {
                        // Line
                        items.push({ type: 'line' });

                        items.push({
                            title: obj.options.text.orderAscending,
                            onclick: function () {
                                obj.orderBy(x, 0);
                            }
                        });
                        items.push({
                            title: obj.options.text.orderDescending,
                            onclick: function () {
                                obj.orderBy(x, 1);
                            }
                        });
                    }
                } else {
                    // Insert new row before
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.insertNewRowBefore'),
                            onclick: function () {
                                var data = [];
                                data[0] = getLabelText(this.state.planningUnit.label, this.state.lang);
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = "";
                                data[5] = true;
                                data[6] = 0;
                                data[7] = 1;
                                obj.insertRow(data, parseInt(y), 1);
                            }.bind(this)
                        });
                    }
                    // after
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.insertNewRowAfter'),
                            onclick: function () {
                                var data = [];
                                data[0] = getLabelText(this.state.planningUnit.label, this.state.lang);
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = "";
                                data[5] = true;
                                data[6] = 0;
                                data[7] = 1;
                                obj.insertRow(data, parseInt(y));
                            }.bind(this)
                        });
                    }
                    // Delete a row
                    if (obj.options.allowDeleteRow == true) {
                        // region id
                        if (obj.getRowData(y)[6] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                }
                            });
                        }
                    }

                    if (x) {
                        // if (obj.options.allowComments == true) {
                        //     items.push({ type: 'line' });

                        //     var title = obj.records[y][x].getAttribute('title') || '';

                        //     items.push({
                        //         title: title ? obj.options.text.editComments : obj.options.text.addComments,
                        //         onclick: function () {
                        //             obj.setComments([x, y], prompt(obj.options.text.comments, title));
                        //         }
                        //     });

                        //     if (title) {
                        //         items.push({
                        //             title: obj.options.text.clearComments,
                        //             onclick: function () {
                        //                 obj.setComments([x, y], '');
                        //             }
                        //         });
                        //     }
                        // }
                    }
                }

                // Line
                items.push({ type: 'line' });

                // Save
                // if (obj.options.allowExport) {
                //     items.push({
                //         title: i18n.t('static.supplyPlan.exportAsCsv'),
                //         shortcut: 'Ctrl + S',
                //         onclick: function () {
                //             obj.download(true);
                //         }
                //     });
                // }

                return items;
            }.bind(this)
        };

        this.el = jexcel(document.getElementById("paputableDiv"), options);
        this.setState({
            loading: false
        })
    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        var rowData = elInstance.getRowData(y);

        if (x == 4 && !isNaN(rowData[4]) && rowData[4].toString().indexOf('.') != -1) {
            console.log("RESP---------", parseFloat(rowData[4]));
            elInstance.setValueFromCoords(4, y, parseFloat(rowData[4]), true);
        }
        this.el.setValueFromCoords(7, y, 1, true);
    }

    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`G${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(6, data[i].y, 0, true);
                    (instance).setValueFromCoords(7, data[i].y, 1, true);
                    (instance).setValueFromCoords(0, data[i].y, getLabelText(this.state.planningUnit.label, this.state.lang), true);
                    z = data[i].y;
                }
            }
        }
    }


    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        PlanningUnitService.getPlanningUnitById(this.props.match.params.planningUnitId).then(response => {
            if (response.status == 200) {
                console.log(response.data);
                this.setState({
                    planningUnit: response.data,
                    //  rows:response.data
                })

                PlanningUnitService.getPlanningUnitCapacityForId(this.props.match.params.planningUnitId).then(response => {
                    if (response.status == 200) {
                        console.log(response.data);
                        this.setState({
                            planningUnitCapacity: response.data,
                            rows: response.data
                        })


                        SupplierService.getSupplierListAll()
                            .then(response => {
                                if (response.status == 200) {
                                    console.log(response.data)
                                    var listArray = response.data;
                                    listArray.sort((a, b) => {
                                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                        return itemLabelA > itemLabelB ? 1 : -1;
                                    });
                                    this.setState({
                                        suppliers: listArray
                                    },
                                        () => {
                                            this.buildJExcel();
                                        })

                                } else {
                                    this.setState({
                                        message: response.data.messageCode, loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
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
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
                        },
                            () => {
                                this.hideSecondComponent();
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
            else {
                this.setState({
                    message: response.data.messageCode
                },
                    () => {
                        this.hideSecondComponent();
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

    addRow = function () {

        console.log("IN addRow");
        var data = [];
        data[0] = getLabelText(this.state.planningUnit.label, this.state.lang);
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = true;
        data[6] = 0;
        data[7] = 1;
        this.el.insertRow(
            data, 0, 1
        );
    };

    changed = function (instance, cell, x, y, value) {
        //     $("#saveButtonDiv").show();
        this.setState({
            changedFlag: 1
        })

        //Supplier
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //start Date
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //End Date
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            var reg = /^[0-9\b]+$/;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
        }

        //validatation for startDate is smaller than endDate
        if (x == 2 || x == 3) {

            // console.log("INNOVA--startDate--> ", this.el.getValueFromCoords(2, y));//startDate
            // console.log("INNOVA--endDate--> ", this.el.getValueFromCoords(3, y));//endDate

            if (moment(this.el.getValueFromCoords(2, y)).isSameOrBefore(moment(this.el.getValueFromCoords(3, y)))) {
                // console.log("IS AFTER");
                var col1 = ("C").concat(parseInt(y) + 1);
                var col2 = ("D").concat(parseInt(y) + 1);
                this.el.setStyle(col1, "background-color", "transparent");
                this.el.setComments(col1, "");
                this.el.setStyle(col2, "background-color", "transparent");
                this.el.setComments(col2, "");

            } else {
                // console.log("IS BEFORE");
                var col1 = ("C").concat(parseInt(y) + 1);
                var col2 = ("D").concat(parseInt(y) + 1);
                this.el.setStyle(col1, "background-color", "transparent");
                this.el.setStyle(col1, "background-color", "yellow");
                this.el.setComments(col1, i18n.t('static.common.startdateCompare'));

                this.el.setStyle(col2, "background-color", "transparent");
                this.el.setStyle(col2, "background-color", "yellow");
                this.el.setComments(col2, i18n.t('static.common.startdateCompare'));
            }
        }


        //Capacity
        // if (x == 4) {
        //     var col = ("E").concat(parseInt(y) + 1);
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, i18n.t('static.label.fieldRequired'));
        //     } else {
        //         if (isNaN(Number.parseInt(value)) || value < 0) {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setStyle(col, "background-color", "yellow");
        //             this.el.setComments(col, i18n.t('static.message.invalidnumber'));
        //         } else {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setComments(col, "");
        //         }

        //     }
        // }
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_NO_REGEX;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // if (isNaN(parseInt(value)) || !(reg.test(value))) {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

        //Active
        if (x != 7) {
            this.el.setValueFromCoords(7, y, 1, true);
        }

    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        this.el.setValueFromCoords(7, y, 1, true);
    }.bind(this);

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        // var asterisk = document.getElementsByClassName("resizable")[0];
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;

        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
    }

    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var col = ("H").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(7, y);
            if (parseInt(value) == 1) {

                //Supplier
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //StartDate
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
                if (value == "Invalid date" || value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //EndDate
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(3, y);
                if (value == "Invalid date" || value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //validatation for startDate is smaller than endDate
                var col1 = ("C").concat(parseInt(y) + 1);
                var col2 = ("D").concat(parseInt(y) + 1);

                if (moment(this.el.getValueFromCoords(2, y)).isSameOrBefore(moment(this.el.getValueFromCoords(3, y)))) {
                    // console.log("IS AFTER");

                    this.el.setStyle(col1, "background-color", "transparent");
                    this.el.setComments(col1, "");
                    this.el.setStyle(col2, "background-color", "transparent");
                    this.el.setComments(col2, "");
                } else {
                    // console.log("IS BEFORE");
                    this.el.setStyle(col1, "background-color", "transparent");
                    this.el.setStyle(col1, "background-color", "yellow");
                    this.el.setComments(col1, i18n.t('static.common.startdateCompare'));

                    this.el.setStyle(col2, "background-color", "transparent");
                    this.el.setStyle(col2, "background-color", "yellow");
                    this.el.setComments(col2, i18n.t('static.common.startdateCompare'));
                    valid = false;
                }


                //Capacity
                // var col = ("E").concat(parseInt(y) + 1);
                // var value = this.el.getValueFromCoords(4, y);
                // if (value == "" || isNaN(Number.parseFloat(value)) || value < 0) {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     valid = false;
                //     if (isNaN(Number.parseInt(value)) || value < 0) {
                //         this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                //     } else {
                //         this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                //     }
                // } else {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setComments(col, "");
                // }

                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_NO_REGEX;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    // if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }
        }
        return valid;
    }




    render() {
        return (

            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                {/* <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} /> */}
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>

                <Card>

                    {/* <CardHeader>
                        <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                    </CardHeader> */}
                    <CardBody className="p-0">

                        <Col xs="12" sm="12">
                            <div className="table-responsive consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                                <div id="paputableDiv" >
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
                        </Col>
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>


            </div >
        );
    }

    cancelClicked() {
        this.props.history.push(`/planningUnit/listPlanningUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}

export default PlanningUnitCapacity
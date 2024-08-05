// import React, { Component } from "react";
// import {
//     Card, CardBody, CardHeader,
//     Label, Input, FormGroup,
//     CardFooter, Button, Table, Col, Row

// } from 'reactstrap';
// import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
// import ProgramService from "../../api/ProgramService";
// import ProductService from "../../api/ProductService"
// import OrganisationService from "../../api/OrganisationService"
// import HealthAreaService from "../../api/HealthAreaService"
// import UserService from "../../api/UserService"
// import RealmCountryService from "../../api/RealmCountryService"
// import AuthenticationService from '../Common/AuthenticationService.js';
// import i18n from '../../i18n'
// import getLabelText from '../../CommonComponent/getLabelText';

// class AccessControlComponent extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             lang: localStorage.getItem('lang'),
//             user: this.props.location.state.user,
//             countries: [],
//             organisations: [],
//             healthAreas: [],
//             programs: [],
//             realmCountryId: '-1',
//             organisationId: '-1',
//             healthAreaId: '-1',
//             programId: '-1',
//             countryName: 'All',
//             healthAreaName: 'All',
//             organisationName: 'All',
//             programName: 'All',
//             productName: '',
//             selRealmCountry: [],
//             realmCountryList: [],
//             selOrganisation: [],
//             selHealthArea: [],
//             selProgram: [],
//             rows: this.props.location.state.user.userAclList
//         }
//         this.addRow = this.addRow.bind(this);
//         this.deleteLastRow = this.deleteLastRow.bind(this);
//         this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
//         this.submitForm = this.submitForm.bind(this);
//         this.setTextAndValue = this.setTextAndValue.bind(this);
//         this.cancelClicked = this.cancelClicked.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.filterOrganisation = this.filterOrganisation.bind(this);
//         this.filterHealthArea = this.filterHealthArea.bind(this);
//         this.filterProgram = this.filterProgram.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);

//     }
//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }
//     filterProgram() {
//         let realmId = this.state.user.realm.realmId;
//         if (realmId != 0 && realmId != null) {
//             const selProgram = this.state.programs.filter(c => c.realmCountry.realm.realmId == realmId)
//             this.setState({
//                 selProgram
//             });
//         } else {
//             this.setState({
//                 selProgram: this.state.programs
//             });
//         }
//     }
//     filterHealthArea() {
//         let realmId = this.state.user.realm.realmId;
//         if (realmId != 0 && realmId != null) {
//             const selHealthArea = this.state.healthAreas.filter(c => c.realm.realmId == realmId)
//             this.setState({
//                 selHealthArea
//             });
//         } else {
//             this.setState({
//                 selHealthArea: this.state.healthAreas
//             });
//         }
//     }
//     filterOrganisation() {
//         let realmId = this.state.user.realm.realmId;
//         if (realmId != 0 && realmId != null) {
//             const selOrganisation = this.state.organisations.filter(c => c.realm.realmId == realmId)
//             this.setState({
//                 selOrganisation
//             });
//         } else {
//             this.setState({
//                 selOrganisation: this.state.organisations
//             });
//         }
//     }
//     filterData() {
//         let realmId = this.state.user.realm.realmId;
//         if (realmId != 0 && realmId != null) {
//             const selRealmCountry = this.state.realmCountryList.filter(c => c.realm.realmId == realmId)
//             this.setState({
//                 selRealmCountry
//             });
//         } else {
//             this.setState({
//                 selRealmCountry: this.state.realmCountryList
//             });
//         }
//     }
//     addRow() {
//         if (this.state.realmCountryId != "" && this.state.healthAreaId != "" && this.state.organisationId != "" && this.state.programId != "") {
//             // let id = [];
//             // id.push(this.state.realmCountryId + "" + this.state.healthAreaId + "" + this.state.organisationId + "" + this.state.programId);
//             var json =
//             {
//                 userId: this.state.user.userId,
//                 realmCountryId: this.state.realmCountryId,
//                 countryName:
//                 {
//                     label_en: this.state.countryName
//                 },
//                 healthAreaId: this.state.healthAreaId,
//                 healthAreaName:
//                 {
//                     label_en: this.state.healthAreaName
//                 },
//                 organisationId: this.state.organisationId,
//                 organisationName:
//                 {
//                     label_en: this.state.organisationName
//                 },
//                 programId: this.state.programId,
//                 programName:
//                 {
//                     label_en: this.state.programName
//                 }
//             }
//             // var array = [];
//             // console.log("length---", this.state.rows.length)
//             // if (this.state.rows.length > 0) {
//             //     for (let i = 0; i <= this.state.rows.length; i++) {
//             //         console.log(this.state.rows[i]);
//             //         if(this.state.rows[i] != null && this.state.rows[i] != ""){
//             //         let newId = this.state.rows[i].realmCountryId + "" + this.state.rows[i].healthAreaId + "" + this.state.rows[i].organisationId + "" + this.state.rows[i].programId;
//             //         array.push(newId);
//             //         }
//             //     }
//             //     if (array.length > 0) {
//             //     for (let i = 0; i < array.length; i++) {
//             //         if (id.indexOf(array[i]) === -1) {
//             //             this.state.rows.push(json)
//             //         }
//             //     }
//             // }
//             // } else {
//                 this.state.rows.push(json)
//             // }
//             // var uniqueNames = [];
//             // $.each(this.state.rows, function (i, el) {
//             //     if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
//             // });
//             // console.log("unique name---", uniqueNames);
//             this.setState({ rows: this.state.rows })
//             // this.setState({ realmCountryId: '', healthAreaId: '', organisationId: '', programId: '', countryName: '', healthAreaName: '', organisationName: '', programName: '' });
//         }
//     }
//     deleteLastRow() {
//         this.setState({
//             rows: this.state.rows.slice(0, -1)
//         });
//     }

//     handleRemoveSpecificRow(idx) {
//         const rows = [...this.state.rows]
//         rows.splice(idx, 1);
//         this.setState({ rows })
//     }

//     setTextAndValue = (event) => {

//         if (event.target.name === 'realmCountryId') {
//             this.setState({ countryName: event.target[event.target.selectedIndex].text });
//             this.setState({ realmCountryId: event.target.value })
//         } else if (event.target.name === 'healthAreaId') {
//             this.setState({ healthAreaName: event.target[event.target.selectedIndex].text });
//             this.setState({ healthAreaId: event.target.value })
//         } else if (event.target.name === 'organisationId') {
//             this.setState({ organisationName: event.target[event.target.selectedIndex].text });
//             this.setState({ organisationId: event.target.value })
//         }
//         else if (event.target.name === 'programId') {
//             this.setState({ programName: event.target[event.target.selectedIndex].text });
//             this.setState({ programId: event.target.value })
//         }
//     };
//     submitForm() {
//         var user = {
//             userId: this.state.user.userId,
//             userAcls: this.state.rows
//         }

//         AuthenticationService.setupAxiosInterceptors();
//         UserService.accessControls(user)
//             .then(response => {
//                 if (response.status == 200) {
//                     this.props.history.push(`/user/listUser/green/${response.data.messageCode}`)
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
//                                 this.setState({ message: error.response.data.messageCode });
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
//         RealmCountryService.getRealmCountryListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         realmCountryList: response.data,
//                         selRealmCountry: response.data
//                     })
//                 }else{
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
//                                 this.setState({ message: error.response.data.messageCode });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 break;
//                         }
//                     }
//                 }
//             );

//         OrganisationService.getOrganisationList().then(response => {
//             if (response.status == "200") {
//                 this.setState({
//                     organisations: response.data,
//                     selOrganisation: response.data
//                 });
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
//                             break;
//                     }
//                 }
//             }
//         );
//         HealthAreaService.getHealthAreaList().then(response => {
//             if (response.status == "200") {
//                 this.setState({
//                     healthAreas: response.data,
//                     selHealthArea: response.data
//                 });
//             } else {
//                 this.setState({
//                     message: response.data.message
//                 })
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
//                             break;
//                     }
//                 }
//             }
//         );
//         ProgramService.getProgramList().then(response => {
//             if (response.status == "200") {
//                 this.setState({
//                     programs: response.data,
//                     selProgram: response.data
//                 });
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
//                             break;
//                     }
//                 }
//             }
//         );

//         this.filterData();
//         this.filterOrganisation();
//         this.filterHealthArea();
//         this.filterProgram();
//     }
//     render() {
//         const { selProgram } = this.state;
//         const { selRealmCountry } = this.state;
//         const { selOrganisation } = this.state;
//         const { selHealthArea } = this.state;
//         let programList = selProgram.length > 0 && selProgram.map((item, i) => {
//             return (
//                 <option key={i} value={item.programId}>
//                     {getLabelText(item.label, this.state.lang)}
//                 </option>
//             )
//         }, this);
//         let countryList = selRealmCountry.length > 0 && selRealmCountry.map((item, i) => {
//             return (
//                 <option key={i} value={item.realmCountryId}>
//                     {getLabelText(item.country.label, this.state.lang)}
//                 </option>
//             )
//         }, this);
//         let organisationList = selOrganisation.length > 0 && selOrganisation.map((item, i) => {
//             return (
//                 <option key={i} value={item.organisationId}>
//                     {getLabelText(item.label, this.state.lang)}
//                 </option>
//             )
//         }, this);
//         let healthAreaList = selHealthArea.length > 0 && selHealthArea.map((item, i) => {
//             return (
//                 <option key={i} value={item.healthAreaId}>
//                     {getLabelText(item.label, this.state.lang)}
//                 </option>
//             )
//         }, this);
//         return (
//             <div className="animated fadeIn">
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
//                 <Row>
//                     <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
//                         <Card>
//                             <CardHeader>
//                                 <strong>{i18n.t('static.user.accessControl')}</strong>
//                             </CardHeader>

//                             <CardBody>
//                             <Row>
//                             <Col sm={6} md={6}>
//                                 <FormGroup>
//                                     <Label htmlFor="select">{i18n.t('static.user.username')}</Label>
//                                     <Input bsSize="sm" type="text" value={this.state.user.username} name="username" id="username" disabled>
//                                     </Input>
//                                 </FormGroup>
//                               </Col>   
//                               <Col sm={6} md={6}>
//                                 <FormGroup>
//                                     <Label  htmlFor="select">{i18n.t('static.program.realmcountry')}</Label>
//                                     <Input bsSize="sm" type="select" name="realmCountryId" id="select" value={this.state.realmCountryId} onChange={event => this.setTextAndValue(event)}>
//                                         <option value="-1">All</option>
//                                         {countryList}
//                                     </Input>
//                                 </FormGroup>
//                             </Col>
//                             </Row>
//                             <Row>
//                             <Col sm={6} md={6}>
//                                 <FormGroup>
//                                     <Label htmlFor="select">{i18n.t('static.healtharea.healtharea')}</Label>
//                                     <Input bsSize="sm" type="select" name="healthAreaId" id="select" value={this.state.healthAreaId} onChange={event => this.setTextAndValue(event)}>
//                                         <option value="-1">All</option>
//                                         {healthAreaList}
//                                     </Input>
//                                 </FormGroup>
//                                 </Col>
//                                 <Col sm={6} md={6}>
//                                 <FormGroup>
//                                     <Label htmlFor="select">{i18n.t('static.organisation.organisation')}</Label>
//                                     <Input bsSize="sm" type="select" name="organisationId" id="select" value={this.state.organisationId} onChange={event => this.setTextAndValue(event)}>
//                                         <option value="-1">All</option>
//                                         {organisationList}
//                                     </Input>
//                                 </FormGroup>
//                                 </Col>
//                                 </Row>
//                                 <Row>
//                             <Col sm={6} md={6}>
//                                 <FormGroup>
//                                     <Label htmlFor="select">{i18n.t('static.program.program')}</Label>
//                                     <Input bsSize="sm" type="select" name="programId" id="select" value={this.state.programId} onChange={event => this.setTextAndValue(event)}>
//                                         <option value="-1">All</option>
//                                         {programList}
//                                     </Input>
//                                 </FormGroup>
//                                 </Col> 
//                                 <Col sm={6} md={6}>

//                                 <FormGroup className="mt-md-4">
//                                     <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> {i18n.t('static.common.rmlastrow')}</Button>
//                                     <Button type="submit" size="sm" color="success" onClick={this.addRow} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
//                                     &nbsp;
//                                 </FormGroup>

//                                 </Col>
//                                 </Row>
//                         </CardBody>

//                         <CardBody>
//                             <div className="table-accesscnl-mt">
//                              <Table responsive className="table-striped table-hover table-bordered text-center ">

//                                     <thead>
//                                         <tr>
//                                             <th className="text-center"> {i18n.t('static.program.realmcountry')} </th>
//                                             <th className="text-center"> {i18n.t('static.healtharea.healtharea')}</th>
//                                             <th className="text-center"> {i18n.t('static.organisation.organisation')} </th>
//                                             <th className="text-center">{i18n.t('static.program.program')}</th>
//                                             <th className="text-center">{i18n.t('static.common.remove')}</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {
//                                             this.state.rows.length > 0
//                                             &&
//                                             this.state.rows.map((item, idx) => (
//                                                 <tr id="addr0" key={idx}>
//                                                     <td>
//                                                         {this.state.rows[idx].realmCountryId != -1 ? this.state.rows[idx].countryName.label_en : "All"}
//                                                     </td>
//                                                     <td>

//                                                         {this.state.rows[idx].healthAreaId != -1 ? this.state.rows[idx].healthAreaName.label_en : "All"}
//                                                     </td>
//                                                     <td>
//                                                         {this.state.rows[idx].organisationId != -1 ? this.state.rows[idx].organisationName.label_en : "All"}
//                                                     </td>
//                                                     <td>
//                                                         {this.state.rows[idx].programId != -1 ? this.state.rows[idx].programName.label_en : "All"}
//                                                     </td>
//                                                     <td>
//                                                         <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} />
//                                                     </td>
//                                                 </tr>
//                                             ))
//                                         }
//                                     </tbody>

//                                 </Table>
//                                 </div>
//                             </CardBody>
//                             <CardFooter>
//                                 <FormGroup>
//                                     <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
//                                     {this.state.rows.length > 0 && <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
//                                     &nbsp;
//                                 </FormGroup>

//                             </CardFooter>
//                         </Card>
//                     </Col>
//                 </Row>
//             </div>

//         );
//     }
//     cancelClicked() {
//         this.props.history.push(`/user/listUser/`+ 'red/' + i18n.t('static.actionCancelled'))
//     }

// }

// export default AccessControlComponent;

//my page(1)
// import React, { Component } from "react";
// import {
//     Card, CardBody, CardHeader,
//     Label, Input, FormGroup,
//     CardFooter, Button, Table, Col, Row

// } from 'reactstrap';
// import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
// import ProgramService from "../../api/ProgramService";
// import ProductService from "../../api/ProductService"
// import OrganisationService from "../../api/OrganisationService"
// import HealthAreaService from "../../api/HealthAreaService"
// import UserService from "../../api/UserService"
// import RealmCountryService from "../../api/RealmCountryService"
// import AuthenticationService from '../Common/AuthenticationService.js';
// import i18n from '../../i18n'
// import getLabelText from '../../CommonComponent/getLabelText';

// class AccessControlComponent extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             lang: localStorage.getItem('lang'),
//             // user: this.props.location.state.user,
//             countries: [],
//             organisations: [],
//             healthAreas: [],
//             programs: [],
//             realmCountryId: '-1',
//             organisationId: '-1',
//             healthAreaId: '-1',
//             programId: '-1',
//             countryName: 'All',
//             healthAreaName: 'All',
//             organisationName: 'All',
//             programName: 'All',
//             productName: '',
//             selRealmCountry: [],
//             realmCountryList: [],
//             selOrganisation: [],
//             selHealthArea: [],
//             selProgram: [],
//             // rows: this.props.location.state.user.userAclList
//         }
//         this.addRow = this.addRow.bind(this);
//         this.deleteLastRow = this.deleteLastRow.bind(this);
//         this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
//         this.submitForm = this.submitForm.bind(this);
//         this.setTextAndValue = this.setTextAndValue.bind(this);
//         this.cancelClicked = this.cancelClicked.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.filterOrganisation = this.filterOrganisation.bind(this);
//         this.filterHealthArea = this.filterHealthArea.bind(this);
//         this.filterProgram = this.filterProgram.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);

//     }
//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }
//     filterProgram() {
//         let realmId = this.state.user.realm.realmId;
//         if (realmId != 0 && realmId != null) {
//             const selProgram = this.state.programs.filter(c => c.realmCountry.realm.realmId == realmId)
//             this.setState({
//                 selProgram
//             });
//         } else {
//             this.setState({
//                 selProgram: this.state.programs
//             });
//         }
//     }
//     filterHealthArea() {
//         let realmId = this.state.user.realm.realmId;
//         if (realmId != 0 && realmId != null) {
//             const selHealthArea = this.state.healthAreas.filter(c => c.realm.realmId == realmId)
//             this.setState({
//                 selHealthArea
//             });
//         } else {
//             this.setState({
//                 selHealthArea: this.state.healthAreas
//             });
//         }
//     }
//     filterOrganisation() {
//         let realmId = this.state.user.realm.realmId;
//         if (realmId != 0 && realmId != null) {
//             const selOrganisation = this.state.organisations.filter(c => c.realm.realmId == realmId)
//             this.setState({
//                 selOrganisation
//             });
//         } else {
//             this.setState({
//                 selOrganisation: this.state.organisations
//             });
//         }
//     }
//     filterData() {
//         let realmId = this.state.user.realm.realmId;
//         if (realmId != 0 && realmId != null) {
//             const selRealmCountry = this.state.realmCountryList.filter(c => c.realm.realmId == realmId)
//             this.setState({
//                 selRealmCountry
//             });
//         } else {
//             this.setState({
//                 selRealmCountry: this.state.realmCountryList
//             });
//         }
//     }
//     addRow() {
//         if (this.state.realmCountryId != "" && this.state.healthAreaId != "" && this.state.organisationId != "" && this.state.programId != "") {
//             // let id = [];
//             // id.push(this.state.realmCountryId + "" + this.state.healthAreaId + "" + this.state.organisationId + "" + this.state.programId);
//             var json =
//             {
//                 userId: this.state.user.userId,
//                 realmCountryId: this.state.realmCountryId,
//                 countryName:
//                 {
//                     label_en: this.state.countryName
//                 },
//                 healthAreaId: this.state.healthAreaId,
//                 healthAreaName:
//                 {
//                     label_en: this.state.healthAreaName
//                 },
//                 organisationId: this.state.organisationId,
//                 organisationName:
//                 {
//                     label_en: this.state.organisationName
//                 },
//                 programId: this.state.programId,
//                 programName:
//                 {
//                     label_en: this.state.programName
//                 }
//             }
//             // var array = [];
//             // console.log("length---", this.state.rows.length)
//             // if (this.state.rows.length > 0) {
//             //     for (let i = 0; i <= this.state.rows.length; i++) {
//             //         console.log(this.state.rows[i]);
//             //         if(this.state.rows[i] != null && this.state.rows[i] != ""){
//             //         let newId = this.state.rows[i].realmCountryId + "" + this.state.rows[i].healthAreaId + "" + this.state.rows[i].organisationId + "" + this.state.rows[i].programId;
//             //         array.push(newId);
//             //         }
//             //     }
//             //     if (array.length > 0) {
//             //     for (let i = 0; i < array.length; i++) {
//             //         if (id.indexOf(array[i]) === -1) {
//             //             this.state.rows.push(json)
//             //         }
//             //     }
//             // }
//             // } else {
//                 this.state.rows.push(json)
//             // }
//             // var uniqueNames = [];
//             // $.each(this.state.rows, function (i, el) {
//             //     if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
//             // });
//             // console.log("unique name---", uniqueNames);
//             this.setState({ rows: this.state.rows })
//             // this.setState({ realmCountryId: '', healthAreaId: '', organisationId: '', programId: '', countryName: '', healthAreaName: '', organisationName: '', programName: '' });
//         }
//     }
//     deleteLastRow() {
//         this.setState({
//             rows: this.state.rows.slice(0, -1)
//         });
//     }

//     handleRemoveSpecificRow(idx) {
//         const rows = [...this.state.rows]
//         rows.splice(idx, 1);
//         this.setState({ rows })
//     }

//     setTextAndValue = (event) => {

//         if (event.target.name === 'realmCountryId') {
//             this.setState({ countryName: event.target[event.target.selectedIndex].text });
//             this.setState({ realmCountryId: event.target.value })
//         } else if (event.target.name === 'healthAreaId') {
//             this.setState({ healthAreaName: event.target[event.target.selectedIndex].text });
//             this.setState({ healthAreaId: event.target.value })
//         } else if (event.target.name === 'organisationId') {
//             this.setState({ organisationName: event.target[event.target.selectedIndex].text });
//             this.setState({ organisationId: event.target.value })
//         }
//         else if (event.target.name === 'programId') {
//             this.setState({ programName: event.target[event.target.selectedIndex].text });
//             this.setState({ programId: event.target.value })
//         }
//     };
//     submitForm() {
//         var user = {
//             userId: this.state.user.userId,
//             userAcls: this.state.rows
//         }

//         AuthenticationService.setupAxiosInterceptors();
//         UserService.accessControls(user)
//             .then(response => {
//                 if (response.status == 200) {
//                     this.props.history.push(`/user/listUser/green/${response.data.messageCode}`)
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
//                                 this.setState({ message: error.response.data.messageCode });
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
//         RealmCountryService.getRealmCountryListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         realmCountryList: response.data,
//                         selRealmCountry: response.data
//                     })
//                 }else{
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
//                                 this.setState({ message: error.response.data.messageCode });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 break;
//                         }
//                     }
//                 }
//             );

//         OrganisationService.getOrganisationList().then(response => {
//             if (response.status == "200") {
//                 this.setState({
//                     organisations: response.data,
//                     selOrganisation: response.data
//                 });
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
//                             break;
//                     }
//                 }
//             }
//         );
//         HealthAreaService.getHealthAreaList().then(response => {
//             if (response.status == "200") {
//                 this.setState({
//                     healthAreas: response.data,
//                     selHealthArea: response.data
//                 });
//             } else {
//                 this.setState({
//                     message: response.data.message
//                 })
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
//                             break;
//                     }
//                 }
//             }
//         );
//         ProgramService.getProgramList().then(response => {
//             if (response.status == "200") {
//                 this.setState({
//                     programs: response.data,
//                     selProgram: response.data
//                 });
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
//                             break;
//                     }
//                 }
//             }
//         );


//         UserService.getUserByUserId(this.props.match.params.userId).then(response => {
//             if (response.status == 200) {
//                 this.setState({
//                     user: response.data,
//                     rows: response.data.userAclList
//                 }, (
//                 ) => {
//                 });
//             }else{
//                 this.setState({
//                     message: response.data.messageCode
//                 },
//                     () => {
//                         this.hideSecondComponent();
//                     })
//             }
//         })

//         this.filterData();
//         this.filterOrganisation();
//         this.filterHealthArea();
//         this.filterProgram();
//     }
//     render() {
//         const { selProgram } = this.state;
//         const { selRealmCountry } = this.state;
//         const { selOrganisation } = this.state;
//         const { selHealthArea } = this.state;
//         let programList = selProgram.length > 0 && selProgram.map((item, i) => {
//             return (
//                 <option key={i} value={item.programId}>
//                     {getLabelText(item.label, this.state.lang)}
//                 </option>
//             )
//         }, this);
//         let countryList = selRealmCountry.length > 0 && selRealmCountry.map((item, i) => {
//             return (
//                 <option key={i} value={item.realmCountryId}>
//                     {getLabelText(item.country.label, this.state.lang)}
//                 </option>
//             )
//         }, this);
//         let organisationList = selOrganisation.length > 0 && selOrganisation.map((item, i) => {
//             return (
//                 <option key={i} value={item.organisationId}>
//                     {getLabelText(item.label, this.state.lang)}
//                 </option>
//             )
//         }, this);
//         let healthAreaList = selHealthArea.length > 0 && selHealthArea.map((item, i) => {
//             return (
//                 <option key={i} value={item.healthAreaId}>
//                     {getLabelText(item.label, this.state.lang)}
//                 </option>
//             )
//         }, this);
//         return (
//             <div className="animated fadeIn">
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
//                 <Row>
//                     <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
//                         <Card>
//                             <CardHeader>
//                                 <strong>{i18n.t('static.user.accessControl')}</strong>
//                             </CardHeader>

//                             <CardBody>
//                             <Row>
//                             <Col sm={6} md={6}>
//                                 <FormGroup>
//                                     <Label htmlFor="select">{i18n.t('static.user.username')}</Label>
//                                     <Input bsSize="sm" type="text" value={this.state.user.username} name="username" id="username" disabled>
//                                     </Input>
//                                 </FormGroup>
//                               </Col>   
//                               <Col sm={6} md={6}>
//                                 <FormGroup>
//                                     <Label  htmlFor="select">{i18n.t('static.program.realmcountry')}</Label>
//                                     <Input bsSize="sm" type="select" name="realmCountryId" id="select" value={this.state.realmCountryId} onChange={event => this.setTextAndValue(event)}>
//                                         <option value="-1">All</option>
//                                         {countryList}
//                                     </Input>
//                                 </FormGroup>
//                             </Col>
//                             </Row>
//                             <Row>
//                             <Col sm={6} md={6}>
//                                 <FormGroup>
//                                     <Label htmlFor="select">{i18n.t('static.healtharea.healtharea')}</Label>
//                                     <Input bsSize="sm" type="select" name="healthAreaId" id="select" value={this.state.healthAreaId} onChange={event => this.setTextAndValue(event)}>
//                                         <option value="-1">All</option>
//                                         {healthAreaList}
//                                     </Input>
//                                 </FormGroup>
//                                 </Col>
//                                 <Col sm={6} md={6}>
//                                 <FormGroup>
//                                     <Label htmlFor="select">{i18n.t('static.organisation.organisation')}</Label>
//                                     <Input bsSize="sm" type="select" name="organisationId" id="select" value={this.state.organisationId} onChange={event => this.setTextAndValue(event)}>
//                                         <option value="-1">All</option>
//                                         {organisationList}
//                                     </Input>
//                                 </FormGroup>
//                                 </Col>
//                                 </Row>
//                                 <Row>
//                             <Col sm={6} md={6}>
//                                 <FormGroup>
//                                     <Label htmlFor="select">{i18n.t('static.program.program')}</Label>
//                                     <Input bsSize="sm" type="select" name="programId" id="select" value={this.state.programId} onChange={event => this.setTextAndValue(event)}>
//                                         <option value="-1">All</option>
//                                         {programList}
//                                     </Input>
//                                 </FormGroup>
//                                 </Col> 
//                                 <Col sm={6} md={6}>

//                                 <FormGroup className="mt-md-4">
//                                     <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> {i18n.t('static.common.rmlastrow')}</Button>
//                                     <Button type="submit" size="sm" color="success" onClick={this.addRow} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
//                                     &nbsp;
//                                 </FormGroup>

//                                 </Col>
//                                 </Row>
//                         </CardBody>

//                         <CardBody>
//                             <div className="table-accesscnl-mt">
//                              <Table responsive className="table-striped table-hover table-bordered text-center ">

//                                     <thead>
//                                         <tr>
//                                             <th className="text-center"> {i18n.t('static.program.realmcountry')} </th>
//                                             <th className="text-center"> {i18n.t('static.healtharea.healtharea')}</th>
//                                             <th className="text-center"> {i18n.t('static.organisation.organisation')} </th>
//                                             <th className="text-center">{i18n.t('static.program.program')}</th>
//                                             <th className="text-center">{i18n.t('static.common.remove')}</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {
//                                             this.state.rows.length > 0
//                                             &&
//                                             this.state.rows.map((item, idx) => (
//                                                 <tr id="addr0" key={idx}>
//                                                     <td>
//                                                         {this.state.rows[idx].realmCountryId != -1 ? this.state.rows[idx].countryName.label_en : "All"}
//                                                     </td>
//                                                     <td>

//                                                         {this.state.rows[idx].healthAreaId != -1 ? this.state.rows[idx].healthAreaName.label_en : "All"}
//                                                     </td>
//                                                     <td>
//                                                         {this.state.rows[idx].organisationId != -1 ? this.state.rows[idx].organisationName.label_en : "All"}
//                                                     </td>
//                                                     <td>
//                                                         {this.state.rows[idx].programId != -1 ? this.state.rows[idx].programName.label_en : "All"}
//                                                     </td>
//                                                     <td>
//                                                         <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} />
//                                                     </td>
//                                                 </tr>
//                                             ))
//                                         }
//                                     </tbody>

//                                 </Table>
//                                 </div>
//                             </CardBody>
//                             <CardFooter>
//                                 <FormGroup>
//                                     <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
//                                     {this.state.rows.length > 0 && <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
//                                     &nbsp;
//                                 </FormGroup>

//                             </CardFooter>
//                         </Card>
//                     </Col>
//                 </Row>
//             </div>

//         );
//     }
//     cancelClicked() {
//         this.props.history.push(`/user/listUser/`+ 'red/' + i18n.t('static.actionCancelled'))
//     }

// }

// export default AccessControlComponent;

//my page(2)
import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form

} from 'reactstrap';
import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
import ProgramService from "../../api/ProgramService";
import DatasetService from "../../api/DatasetService";
import ProductService from "../../api/ProductService"
import OrganisationService from "../../api/OrganisationService"
import HealthAreaService from "../../api/HealthAreaService"
import UserService from "../../api/UserService"
import RealmCountryService from "../../api/RealmCountryService"
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText';

import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import moment from "moment";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { API_URL, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
// const entityname = i18n.t('static.dashboad.planningunitcapacity')

class AccessControlComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            lang: localStorage.getItem('lang'),
            // user: this.props.location.state.user,
            countries: [],
            organisations: [],
            healthAreas: [],
            programs: [],
            realmCountryId: '-1',
            organisationId: '-1',
            healthAreaId: '-1',
            programId: '-1',
            countryName: 'All',
            healthAreaName: 'All',
            organisationName: 'All',
            programName: 'All',
            productName: '',
            selRealmCountry: [],
            realmCountryList: [],
            selOrganisation: [],
            selHealthArea: [],
            selProgram: [],
            // rows: this.props.location.state.user.userAclList
        }
        this.addRow = this.addRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.filterData = this.filterData.bind(this);
        this.filterOrganisation = this.filterOrganisation.bind(this);
        this.filterHealthArea = this.filterHealthArea.bind(this);
        this.filterProgram = this.filterProgram.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.onPaste = this.onPaste.bind(this);
    }
    hideSecondComponent() {

        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    filterProgram() {
        let realmId = this.state.user.realm.realmId;
        if (realmId != 0 && realmId != null) {
            const selProgram = this.state.programs.filter(c => c.realmCountry.realm.realmId == realmId && c.active.toString() == "true")
            this.setState({
                selProgram
            });
        } else {
            this.setState({
                selProgram: this.state.programs
            });
        }
    }
    filterHealthArea() {
        let realmId = this.state.user.realm.realmId;
        let selHealthArea;
        if (realmId != 0 && realmId != null) {
            selHealthArea = this.state.healthAreas.filter(c => c.realm.realmId == realmId)
        } else {
            selHealthArea = this.state.healthAreas
        }

        this.setState({
            selHealthArea
        });
    }
    filterOrganisation() {
        let realmId = this.state.user.realm.realmId;
        if (realmId != 0 && realmId != null) {
            const selOrganisation = this.state.organisations.filter(c => c.realm.realmId == realmId && c.active.toString() == "true")
            this.setState({
                selOrganisation
            });
        } else {
            this.setState({
                selOrganisation: this.state.organisations
            });
        }
    }
    filterData() {
        let realmId = this.state.user.realm.realmId;
        if (realmId != 0 && realmId != null) {
            const selRealmCountry = this.state.realmCountryList.filter(c => c.realm.realmId == realmId && c.active.toString() == "true")
            this.setState({
                selRealmCountry
            });
        } else {
            this.setState({
                selRealmCountry: this.state.realmCountryList
            });
        }
    }
    buildJexcel() {
        const { selProgram } = this.state;
        const { selRealmCountry } = this.state;
        const { selOrganisation } = this.state;
        const { selHealthArea } = this.state;
        let programList = [];
        let countryList = [];
        let organisationList = [];
        let healthAreaList = [];

        if (selProgram.length > 0) {
            for (var i = 0; i < selProgram.length; i++) {
                var name = selProgram[i].programCode + " (" + (selProgram[i].programTypeId == 1 ? "SP" : selProgram[i].programTypeId == 2 ? "FC" : "") + ")";
                var paJson = {
                    // name: getLabelText(selProgram[i].label, this.state.lang),
                    name: name,
                    id: parseInt(selProgram[i].programId),
                    active: selProgram[i].active
                }
                programList[i] = paJson
            }
            var paJson = {
                // name: "All",
                name: "All",
                id: -1,
                active: true
            }
            programList.unshift(paJson);
        }

        if (selRealmCountry.length > 0) {
            for (var i = 0; i < selRealmCountry.length; i++) {
                var paJson = {
                    name: getLabelText(selRealmCountry[i].country.label, this.state.lang),
                    id: parseInt(selRealmCountry[i].realmCountryId),
                    active: selRealmCountry[i].active
                }
                countryList[i] = paJson
            }
            var paJson = {
                name: "All",
                id: -1,
                active: true
            }
            countryList.unshift(paJson);
        }

        if (selOrganisation.length > 0) {
            for (var i = 0; i < selOrganisation.length; i++) {
                var paJson = {
                    name: getLabelText(selOrganisation[i].label, this.state.lang),
                    id: parseInt(selOrganisation[i].organisationId),
                    active: selOrganisation[i].active
                }
                organisationList[i] = paJson
            }
            var paJson = {
                name: "All",
                id: -1,
                active: true
            }
            organisationList.unshift(paJson);
        }

        if (selHealthArea.length > 0) {
            for (var i = 0; i < selHealthArea.length; i++) {
                var paJson = {
                    name: getLabelText(selHealthArea[i].label, this.state.lang),
                    id: parseInt(selHealthArea[i].healthAreaId),
                    active: selHealthArea[i].active
                }
                healthAreaList[i] = paJson
            }
            var paJson = {
                name: "All",
                id: -1,
                active: true
            }
            healthAreaList.unshift(paJson);
        }

        // console.log("programList----", programList);
        // console.log("countryList----",countryList);
        // console.log("organisationList----",organisationList);
        // console.log("healthAreaList---",healthAreaList);

        var papuList = this.state.rows;
        var data = [];
        var papuDataArr = [];
        // console.log("this.state.user.username------",papuList);

        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {


                data = [];
                data[0] = this.state.user.username;
                data[1] = papuList[j].realmCountryId;
                data[2] = papuList[j].healthAreaId;
                data[3] = papuList[j].organisationId;
                data[4] = papuList[j].programId;
                papuDataArr[count] = data;
                count++;


            }
        }

        // console.log("inventory Data Array-->", papuDataArr);
        if (papuDataArr.length == 0) {
            data = [];
            data[0] = this.state.user.username;
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
                    title: i18n.t('static.username.username'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.realmcountry'),
                    type: 'autocomplete',
                    source: countryList,
                    // filter: this.filterCountry

                },
                {
                    title: i18n.t('static.dashboard.healthareaheader'),
                    type: 'autocomplete',
                    source: healthAreaList,
                    // filter: this.filterHealthArea

                },
                {
                    title: i18n.t('static.organisation.organisation'),
                    type: 'autocomplete',
                    source: organisationList,
                    // filter: this.filterOrganisation

                },
                {
                    title: i18n.t('static.dashboard.programheader'),
                    type: 'autocomplete',
                    source: programList,
                    // filter: this.filterProgram

                },

            ],
            editable: true,
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
            oneditionend: this.onedit,
            copyCompatibility: true,
            parseFormulas: true,
            onpaste: this.onPaste,
            // text: {
            //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
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
                                data[0] = this.state.user.username;
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = "";
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
                                data[0] = this.state.user.username;
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = "";
                                obj.insertRow(data, parseInt(y));
                            }.bind(this)
                        });
                    }
                    // Delete a row
                    if (obj.options.allowDeleteRow == true) {
                        // region id
                        // if (obj.getRowData(y)[8] == 0) {
                        items.push({
                            title: i18n.t("static.common.deleterow"),
                            onclick: function () {
                                obj.deleteRow(parseInt(y));
                            }
                        });
                        // }
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
    addRow() {

        var data = [];
        data[0] = this.state.user.username;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        this.el.insertRow(
            data, 0, 1
        );
    }
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                (instance).setValueFromCoords(0, data[i].y, this.state.user.username, true);
                z = data[i].y;
            }
        }
    }
    submitForm() {
        var validation = this.checkValidation();
        // console.log("validation************", validation);
        if (validation) {

            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                let json =
                {
                    userId: this.state.user.userId,
                    realmCountryId: parseInt(map1.get("1")),
                    healthAreaId: parseInt(map1.get("2")),
                    organisationId: parseInt(map1.get("3")),
                    programId: parseInt(map1.get("4")),
                }
                changedpapuList.push(json);
            }
            var user = {
                userId: this.state.user.userId,
                userAcls: changedpapuList
            }

            // AuthenticationService.setupAxiosInterceptors();
            UserService.accessControls(user)
                .then(response => {
                    if (response.status == 200) {
                        this.props.history.push(`/user/listUser/green/${response.data.messageCode}`)
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
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                            }
                        }
                    }
                );

        }



    }
    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        RealmCountryService.getRealmCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realmCountryList: listArray,
                        selRealmCountry: listArray
                    })
                    OrganisationService.getOrganisationList()
                        .then(response => {
                            if (response.status == "200") {
                                var listArray = response.data;
                                listArray.sort((a, b) => {
                                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                    return itemLabelA > itemLabelB ? 1 : -1;
                                });
                                this.setState({
                                    organisations: listArray,
                                    selOrganisation: listArray
                                });
                                HealthAreaService.getHealthAreaList()
                                    .then(response => {
                                        if (response.status == "200") {
                                            var listArray = response.data;
                                            listArray.sort((a, b) => {
                                                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                                return itemLabelA > itemLabelB ? 1 : -1;
                                            });
                                            this.setState({
                                                healthAreas: listArray.filter(c => c.active == true),
                                                selHealthArea: listArray.filter(c => c.active == true)
                                            });
                                            ProgramService.getProgramList()
                                                .then(response => {
                                                    if (response.status == "200") {
                                                        //                                                         var listArray = [...response.data]
                                                        //                                                         var arr = [];
                                                        // for (var i = 0; i <= response.data.length; i++) {
                                                        //     response.data[i].programTypeId = 1;
                                                        // }
                                                        // var listArray = response.data;
                                                        // listArray.sort((a, b) => {
                                                        //     var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                                        //     var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                                        //     return itemLabelA > itemLabelB ? 1 : -1;
                                                        // });
                                                        DatasetService.getDatasetList()
                                                            .then(response1 => {
                                                                if (response1.status == "200") {

                                                                    var listArray = [...response.data, ...response1.data]
                                                                    listArray.sort((a, b) => {
                                                                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                                                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                                                        return itemLabelA > itemLabelB ? 1 : -1;
                                                                    });
                                                                    this.setState({
                                                                        programs: listArray,
                                                                        selProgram: listArray
                                                                    });
                                                                }



                                                                UserService.getUserByUserId(this.props.match.params.userId)
                                                                    .then(response => {
                                                                        if (response.status == 200) {
                                                                            this.setState({
                                                                                user: response.data,
                                                                                rows: response.data.userAclList
                                                                            }, (
                                                                            ) => {
                                                                                this.filterData();
                                                                                this.filterOrganisation();
                                                                                this.filterHealthArea();
                                                                                this.filterProgram();
                                                                                this.buildJexcel();
                                                                            });
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
                                                            }).catch(
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
                                        } else {
                                            this.setState({
                                                message: response.data.message
                                            })
                                        }

                                    }).catch(
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

    changed = function (instance, cell, x, y, value) {

        this.setState({
            changedFlag: 1
        })

        //Country
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

        //TechnicalArea
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

        //Organisation
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //Program
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

    }.bind(this);
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {

            //Country
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

            //TechnicalArea
            var col = ("C").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(2, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            //Organisation
            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            //Program
            var col = ("E").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(4, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

        }
        return valid;
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        // var asterisk = document.getElementsByClassName("resizable")[0];
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;

        var tr = asterisk.firstChild;
        // tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
    }

    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        return (

            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message)}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>

                <div>
                    <Card>

                        {/* <CardHeader>
    <i className="icon-note"></i><strong>{i18n.t('static.user.accessControl')}</strong>{' '}
</CardHeader> */}
                        <CardBody className="p-0">

                            <Col xs="12" sm="12">

                                <div id="paputableDiv" className="consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>

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
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}>{i18n.t('static.common.addRow')}</Button>
                                &nbsp;
                            </FormGroup>
                        </CardFooter>
                    </Card>
                </div>




            </div >
        );
    }



    cancelClicked() {
        this.props.history.push(`/user/listUser/` + 'red/' + i18n.t('static.actionCancelled'))
    }

}

export default AccessControlComponent;


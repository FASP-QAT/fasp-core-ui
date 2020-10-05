import React, { Component } from 'react';
import {
  Card,
  CardBody, FormGroup, Label, Form, InputGroupAddon, Button
} from 'reactstrap';
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import MultiSelect from "react-multi-select-component";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME } from '../../Constants.js'
import CryptoJS from 'crypto-js'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
const ref = React.createRef();

class DeleteLocalProgramComponent extends Component {
  constructor(props) {
    super(props);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      lang: localStorage.getItem('lang'),
      programValues: [],
      programLabels: [],
      programs: [],
      message: '',
      loading: true
    };

    this.getPrograms = this.getPrograms.bind(this)
    this.handleChangeProgram = this.handleChangeProgram.bind(this)

  }

  confirmDeleteLocalProgram = () => {
    confirmAlert({
      message: i18n.t('static.program.confirmDelete'),
      buttons: [
        {
          label: i18n.t('static.program.yes'),
          onClick: () => {
            this.deleteLocalProgram();
          }
        },
        {
          label: i18n.t('static.program.no')
        }
      ]
    });
  }

  deleteLocalProgram = () => {
    console.log("yes delete---------------")
  }
  handleChangeProgram(programIds) {
    programIds = programIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      programValues: programIds.map(ele => ele),
      programLabels: programIds.map(ele => ele.label)
    })

  }

  getPrograms() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: 'red'
      })
      // this.hideFirstComponent()
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
        // this.hideFirstComponent()
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
            var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson1 = JSON.parse(programData);
            var programJson = {
              label: programJson1.programCode + "~v" + myResult[i].version,
              value: myResult[i].id
            }
            proList.push(programJson)
          }
        }
        console.log("proList---", proList);
        this.setState({
          programs: proList, loading: false
        })
      }.bind(this);
    }.bind(this)
  }



  componentDidMount() {
    this.getPrograms()
  }

  onRadioBtnClick(radioSelected) {
    this.setState({
      radioSelected: radioSelected,
    });
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    const { programs } = this.state;
    let programList = programs.length > 0
      && programs.map((item, i) => {
        return (

          { label: item.label, value: item.value }

        )
      }, this);

    return (
      <div className="animated fadeIn" >
        <AuthenticationServiceComponent history={this.props.history} />
        <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
        <h5 className="red">{i18n.t(this.state.message)}</h5>

        <Card style={{ display: this.state.loading ? "none" : "block" }}>
          <CardBody className="pb-lg-2 pt-lg-0">
            <div ref={ref}>
              <Form >
                <div className="pl-0">
                  <div className="row">
                    <FormGroup className="col-md-3">
                      <Label htmlFor="programIds">{i18n.t('static.program.program')}</Label>
                      <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>

                      <MultiSelect

                        bsSize="sm"
                        name="programIds"
                        id="programIds"
                        value={this.state.programValues}
                        onChange={(e) => { this.handleChangeProgram(e) }}
                        options={programList && programList.length > 0 ? programList : []}
                      />

                    </FormGroup>
                    <div style={{ marginTop: '25px' }}>
                      <Button color="secondary Gobtn btn-sm" onClick={this.confirmDeleteLocalProgram}>{i18n.t('static.common.go')}</Button>
                    </div>
                  </div>
                </div>
              </Form>
            </div>

          </CardBody>
        </Card>
        <div style={{ display: this.state.loading ? "block" : "none" }}>
          <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
            <div class="align-items-center">
              <div ><h4> <strong>Loading...</strong></h4></div>

              <div class="spinner-border blue ml-4" role="status">

              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default DeleteLocalProgramComponent;

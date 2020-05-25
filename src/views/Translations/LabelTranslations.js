import React from "react";
import jexcel from 'jexcel';


import "../ProductCategory/style.css"
import "../../../node_modules/jexcel/dist/jexcel.css";
import {
    Card, CardBody, CardHeader, FormGroup,
    CardFooter, Button, Col, Row
} from 'reactstrap';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import LabelsService from '../../api/LabelService.js';

const entityname = i18n.t('static.label.labelTranslations');
export default class DatabaseTranslations extends React.Component {

    constructor(props) {
        super(props);
        this.options = props.options;
        this.state = {
            changedFlag: [],
            labelList: [],
            rowId: 1
        }
        this.saveData = this.saveData.bind(this)
        this.cancelClicked = this.cancelClicked.bind(this);
        this.loaded = this.loaded.bind(this);
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        LabelsService.getStaticLabelsList().then(response => {
            if (response.status == 200) {
                var json = response.data;
                var data = [];
                var label = [];
                for (var i = 0; i < json.length; i++) {
                    data = [];
                    data[0] = json[i].labelId;// A
                    data[1] = json[i].labelCode;// A
                    data[2] = json[i].label_en;//B
                    data[3] = json[i].label_fr;//C
                    data[4] = json[i].label_pr;//D
                    data[5] = json[i].label_sp;//E
                    label[i] = data;
                }
                var options = {
                    data: label,
                    colHeaders: [
                        `${i18n.t('static.translation.labelId')}`,
                        `${i18n.t('static.translation.labelCode')}`,
                        `${i18n.t('static.translation.english')}`,
                        `${i18n.t('static.translation.french')}`,
                        `${i18n.t('static.translation.pourtegese')}`,
                        `${i18n.t('static.translation.spanish')}`
                    ],
                    colWidths: [80, 80, 80, 80, 80],
                    columns: [
                        { type: 'hidden' },
                        { type: 'text', readOnly: true },
                        { type: 'text' },
                        { type: 'text' },
                        { type: 'text' },
                        { type: 'text' },
                    ],
                    text: {
                        showingPage: 'Showing page {0} of {1} pages',
                        show: '',
                        entries: '',
                    },
                    pagination: 10,
                    search: true,
                    columnSorting: true,
                    tableOverflow: true,
                    wordWrap: true,
                    paginationOptions: [10, 25, 50, 100],
                    allowInsertColumn: false,
                    allowManualInsertColumn: false,
                    onchange: this.changed,
                    oneditionstart: this.editStart,
                    allowDeleteRow: false,
                    tableOverflow: false,
                    onload: this.loaded
                    // tableHeight: '500px',
                };
                this.el = jexcel(document.getElementById("labelTranslationTable"), options);
            } else {
                this.setState({
                    message: response.data.message
                })
            }
        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({ message: error.message });
                } else {
                    switch (error.response ? error.response.status : "") {
                        case 500:
                        case 401:
                        case 404:
                        case 406:
                        case 412:
                            this.setState({ message: error.response.data.messageCode });
                            break;
                        default:
                            this.setState({ message: 'static.unkownError' });
                            break;
                    }
                }
            }
        )
    };

    loaded = function (instance, cell, x, y, value) {
        var obj = {};
        obj.options = {};
        var elInstance = instance.jexcel;
        elInstance.hideIndex(0);
        console.log("In loaded function hide method");
        var searchContainer = document.getElementsByClassName('jexcel_filter')[0];
        var searchDiv=(document.getElementsByClassName('jexcel_filter')[0]).childNodes[1];
        console.log("Search div",searchDiv);
        searchDiv.removeChild(((document.getElementsByClassName('jexcel_filter')[0]).childNodes[1]).childNodes[0]);
        document.getElementsByClassName("jexcel_search")[0].placeholder = "Search"; 
        // searchContainer.classList.add('TableCust');
        console.log('searchContainer', searchContainer);
        var clearBtn = document.createElement('button');
        clearBtn.type = "button";
        clearBtn.classList.add('btn-default');
        clearBtn.classList.add('btn');
        clearBtn.classList.add('jexcel_clear_btn');

        var clarText = document.createTextNode('Clear');
        clearBtn.setAttribute("id", "clearBtnID");
        clearBtn.appendChild(clarText);
        searchContainer.appendChild(clearBtn);

        // var paginationFirst=document.getElementsByClassName('jexcel_pagination')[0];
        // var paginationInfo = paginationFirst.createElement('span');
        // paginationInfo.classList.add('bottom_entries');
        // paginationInfo.classList.add('col-md-7');
        // paginationInfo.classList.add('order-2');
        // paginationInfo.classList.add('pl-lg-0');


        // var paginationPages = paginationFirst.createElement('div');
        // paginationPages.classList.add('col-md-4');
        // paginationPages.classList.add('order-3');
        // paginationPages.classList.add('f-End');

        // obj.pagination.appendChild(paginationInfo);
        // obj.pagination.appendChild(paginationPages);
        //  obj.pagination.appendChild(paginationUpdateContainer);

        var jexcel_pagination = document.getElementsByClassName('jexcel_pagination')[0];
        jexcel_pagination.lastChild.classList.add('order-3');
        console.log(obj.show, '....................in show');
        jexcel_pagination.firstChild.classList.add('order-2');
        jexcel_pagination.firstChild.classList.add('mr-auto');


        var jexcel_filterFirstdiv = document.getElementsByClassName('jexcel_filter')[0];
        var filter = jexcel_filterFirstdiv.firstChild;
        filter.classList.add('order-1');
        jexcel_pagination.appendChild(filter);





        // document.getElementById("clearBtnID").onclick= function(){alert("ok");}
    }

    saveData = function () {
        var labelList = this.state.labelList;
        var tableJson = this.el.getRowData(this.state.rowId);
        var mapOfLastRow = new Map(Object.entries(tableJson))
        var jsonOfLastRow = {
            labelId: mapOfLastRow.get("0"),
            label_en: mapOfLastRow.get("2"),
            label_sp: mapOfLastRow.get("5"),
            label_fr: mapOfLastRow.get("3"),
            label_pr: mapOfLastRow.get("4"),
        }
        labelList[this.state.rowId] = (JSON.stringify(jsonOfLastRow));
        this.setState({
            labelList: labelList
        })
        if (JSON.stringify(this.el.getComments()).length == 2) {
            AuthenticationService.setupAxiosInterceptors();
            var json = this.state.labelList;
            LabelsService.saveStaticLabels(json).then(response => {
                if (response.status == 200) {
                    this.props.history.push(`/dashboard/` + i18n.t(response.data.messageCode))
                } else {
                    this.setState({
                        message: response.data.message
                    })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );
        } else {
            alert(`${i18n.t('static.label.validData')}`);
        }
    };

    render() {
        return (
            <div className="animated fadeIn">
                <h5>{i18n.t(this.state.message)}</h5>
                <Row>

                    <Col xs="12" sm="12">
                        <Card>
                            <CardHeader>

                                <strong>{i18n.t('static.label.labelTranslations')}</strong>
                            </CardHeader>
                            <CardBody className="table-responsive pt-md-1 pb-md-1">
                                {/* <div id="loader" className="center"></div> */}
                                <div id="labelTranslationTable"></div>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={() => this.saveData()} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')} </Button>
                                    &nbsp;
                            </FormGroup>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }

    cancelClicked() {
        this.props.history.push(`/dashboard/` + i18n.t('static.message.cancelled', { entityname }))
    }

    changed = function (instance, cell, x, y, value) {
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            this.el.setStyle(col, "background-color", "transparent");
            this.el.setStyle(col, "background-color", "yellow");
            if (value == "") {
                this.el.setComments(col, `${i18n.t('static.label.fieldRequired')}`);
            } else {
                this.el.setComments(col, "");
            }
        } else if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            this.el.setStyle(col, "background-color", "transparent");
            this.el.setStyle(col, "background-color", "yellow");
        } else if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            this.el.setStyle(col, "background-color", "transparent");
            this.el.setStyle(col, "background-color", "yellow");
        } else if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            this.el.setStyle(col, "background-color", "transparent");
            this.el.setStyle(col, "background-color", "yellow");
        }

        var labelList = this.state.labelList;
        var tableJson = this.el.getRowData(y);
        var map = new Map(Object.entries(tableJson))
        var json = {
            labelId: map.get("0"),
            label_en: map.get("2"),
            label_sp: map.get("5"),
            label_fr: map.get("3"),
            label_pr: map.get("4"),
            languageId: map.get("6")
        }
        labelList[y] = (JSON.stringify(json));
        this.setState({
            labelList: labelList
        })
    }.bind(this)

    editStart = function (instance, cell, x, y, value) {
        this.setState({
            rowId: y
        })
    }.bind(this)
}



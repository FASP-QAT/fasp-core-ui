import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import { MultiSelect } from 'react-multi-select-component';
import { Card, CardBody, Form, FormGroup, Label } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import { LOGO } from '../../CommonComponent/Logo.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import DropdownService from '../../api/DropdownService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, filterOptions, formatter, hideSecondComponent } from "../../CommonComponent/JavascriptCommonFunctions";
// Localized entity name
const entityname = i18n.t('static.region.region');
/**
 * Component for list of region details.
 */
class RegionListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            regionList: [],
            message: '',
            selRegion: [],
            realmCountryList: [],
            lang: localStorage.getItem('lang'),
            loading: true,
            countryValues: [],
            countryLabels: [],
        }
        this.filterData = this.filterData.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
    }
    /**
     * Exports the data to a PDF file.
     */
    exportPDF = () => {
        const addFooters = doc => {
            const pageCount = doc.internal.getNumberOfPages()
            for (var i = 1; i <= pageCount; i++) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(6)
                doc.setPage(i)
                doc.setPage(i)
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })
                doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })
            }
        }
        const addHeaders = doc => {
            const pageCount = doc.internal.getNumberOfPages()
            for (var i = 1; i <= pageCount; i++) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.regionHead.region'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    var y = 90
                    var planningText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, y, planningText)
                    for (var i = 0; i < planningText.length; i++) {
                        if (y > doc.internal.pageSize.height - 100) {
                            doc.addPage();
                            y = 80;
                        } else {
                            y = y + 10
                        }
                    }
                }
            }
        }
        const unit = "pt";
        const size = "A4"; 
        const orientation = "landscape"; 
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        const title = i18n.t('static.regionHead.region');
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        const headers = [];
        headers.push(i18n.t('static.region.country'));
        headers.push(i18n.t('static.region.region'));
        headers.push(i18n.t('static.region.capacitycbm'));
        headers.push(i18n.t('static.region.gln'));
        headers.push(i18n.t('static.common.status'));
        let data = this.state.selRegion.map(ele => [
            getLabelText(ele.realmCountry.label, this.state.lang),
            getLabelText(ele.region.label, this.state.lang),
            formatter(ele.capacityCbm,0),
            ele.gln,
            ele.active ? i18n.t('static.common.active') : i18n.t('static.dataentry.inactive')
        ]);
        let content = {
            margin: { top: 90, bottom: 70 },
            startY: 130,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 152, halign: 'center' },
            columnStyles: {
                4: { cellWidth: 153.89 },
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.regionHead.region') + '.pdf')
    }
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        var csvRow = [];
        this.state.countryLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('')
        const headers = [];
        headers.push(i18n.t('static.region.country'));
        headers.push(i18n.t('static.region.region'));
        headers.push(i18n.t('static.region.capacitycbm'));
        headers.push(i18n.t('static.region.gln'));
        headers.push(i18n.t('static.common.status'));
        var A = [addDoubleQuoteToRowContent(headers)]
        this.state.selRegion.map(ele => A.push(addDoubleQuoteToRowContent([(getLabelText(ele.realmCountry.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.region.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.capacityCbm, ele.gln == null ? '' : ele.gln, (ele.active ? i18n.t('static.common.active') : i18n.t('static.dataentry.inactive'))])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.regionHead.region') + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    /**
     * Handles the change event for countries.
     * @param {Array} countrysId - An array containing the selected country IDs.
     */
    handleChange(countrysId) {
        countrysId = countrysId.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            countryValues: countrysId.map(ele => ele),
            countryLabels: countrysId.map(ele => ele.label)
        }, () => {
            this.filterData()
        })
    }
    /**
     * Builds the jexcel component to display region list.
     */
    buildJexcel() {
        let regionList = this.state.selRegion;
        let regionListArray = [];
        let count = 0;
        for (var j = 0; j < regionList.length; j++) {
            data = [];
            data[0] = regionList[j].region.id
            data[1] = getLabelText(regionList[j].realmCountry.label, this.state.lang)
            data[2] = getLabelText(regionList[j].region.label, this.state.lang)
            data[3] = (regionList[j].capacityCbm);
            data[4] = regionList[j].gln
            data[5] = regionList[j].active;
            regionListArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = regionListArray;
        var options = {
            data: data,
            columnDrag: false,
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'regionListId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.region.country'),
                    type: 'text',
                }
                ,
                {
                    title: i18n.t('static.region.region'),
                    type: 'text',
                }
                ,
                {
                    title: i18n.t('static.region.capacitycbm'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.region.gln'),
                    type: 'text',
                },
                {
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.dataentry.inactive') }
                    ]
                },
            ],
            editable: false,
            onload: loadedForNonEditableTables,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };
        var regionEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = regionEl;
        this.setState({
            regionEl: regionEl, loading: false
        })
    }
    /**
     * Fetches and filters warehouse capacity data based on selected countries.
     */
    filterData() {
        let CountryIds = this.state.countryValues.map(ele => (ele.value).toString());
        if (this.state.countryValues.length > 0) {
            this.setState({ loading: true, message: '' })
            let inputjson = {
                realmCountryIds: CountryIds
            }
            ReportService.wareHouseCapacityByCountry(inputjson)
                .then(response => {
                    this.setState({
                        regionList: response.data,
                        selRegion: response.data,
                        loading: false
                    }, () => {
                        this.buildJexcel()
                    })
                }).catch(
                    error => {
                        this.setState({
                            regionList: [],
                            selRegion: [],
                            loading: false
                        }, () => {
                            this.el = jexcel(document.getElementById("tableDiv"), '');
                            jexcel.destroy(document.getElementById("tableDiv"), true);
                        })
                        if (error.message === "Network Error") {
                            this.setState({
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
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
        } else if (this.state.countryValues.length == 0) {
            this.setState({ message: i18n.t('static.healtharea.countrytext'), data: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            });
        }
    }
    /**
     * Fetches the realm country list from the server on page load.
     */
    componentDidMount() {
        let realmId = AuthenticationService.getRealmId();
        DropdownService.getRealmCountryDropdownList(realmId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realmCountryList: listArray,
                        loading: false
                    },
                        () => { })
                } else {
                    this.setState({ message: response.data.messageCode, loading: false },
                        () => { hideSecondComponent(); })
                }
            })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
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
    /**
     * Renders the region list.
     * @returns {JSX.Element} - Region list.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const { realmCountryList } = this.state;
        let countryList = realmCountryList.length > 0 && realmCountryList.map((item, i) => {
            return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
        }, this);
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        {this.state.selRegion.length > 0 &&
                            <div className="card-header-actions">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }
                    </div>
                    <CardBody className="pb-lg-5 pt-lg-2 ">
                        <div className="" >
                            <div>
                                <Form >
                                    <div className="pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3 ZindexFeild">
                                                <Label htmlFor="countrysId">{i18n.t('static.program.realmcountry')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls edit">
                                                    <MultiSelect
                                                        bsSize="sm"
                                                        name="countrysId"
                                                        id="countrysId"
                                                        value={this.state.countryValues}
                                                        onChange={(e) => { this.handleChange(e) }}
                                                        options={countryList && countryList.length > 0 ? countryList : []}
                                                        overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                        selectSomeItems: i18n.t('static.common.select')}}
                                                        filterOptions={filterOptions}
                                                    />
                                                </div>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </Form>
                                <div className="werehousecapacitySearchposition" >
                                    <div id="tableDiv" style={{ display: this.state.loading ? "none" : "block" }} className="jexcelremoveReadonlybackground"> </div>
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
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default RegionListComponent;
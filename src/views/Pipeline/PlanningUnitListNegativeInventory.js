import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { API_URL, JEXCEL_PRO_KEY } from '../../Constants';
import PipelineService from '../../api/PipelineService.js';
import i18n from '../../i18n';
/**
 * Component to display negative inventory
 */
export default class PlanningUnitListNegativeInventory extends Component {
    constructor(props) {
        super(props);
        this.cancelClicked = this.cancelClicked.bind(this);
    }
    /**
     * Reterives planning unit list with final inventory on component mount
     */
    componentDidMount() {
        PipelineService.getPlanningUnitListWithFinalInventry(this.props.match.params.pipelineId)
            .then(response => {
                var planningUnitListFinalInventory = response.data;
                var negtiveInventoryList = (planningUnitListFinalInventory).filter(c => c.inventory < 0);
                var dataArray = [];
                var data = [];
                for (var j = 0; j < negtiveInventoryList.length; j++) {
                    data = [];
                    data[0] = negtiveInventoryList[j].label.label_en;
                    data[1] = negtiveInventoryList[j].inventory;
                    dataArray.push(data);
                }
                this.el = jexcel(document.getElementById("planningUnitList"), '');
                jexcel.destroy(document.getElementById("planningUnitList"), true);
                var data = dataArray;
                var options = {
                    data: data,
                    columnDrag: false,
                    colWidths: [300, 70],
                    columns: [
                        {
                            title: i18n.t('static.report.planningUnit'),
                            type: 'text',
                        },
                        {
                            title: i18n.t('static.inventory.totalInvontory'),
                            type: 'numeric',
                        }
                    ],
                    editable: false,
                    pagination: false,
                    search: true,
                    columnSorting: true,
                    wordWrap: true,
                    allowInsertColumn: false,
                    allowManualInsertColumn: false,
                    allowDeleteRow: false,
                    onchange: this.changed,
                    oneditionend: this.onedit,
                    copyCompatibility: true,
                    onload: this.loaded,
                    filters: true,
                    contextMenu: function (obj, x, y, e) {
                        return false;
                    }.bind(this),
                    license: JEXCEL_PRO_KEY,
                };
                var elVar = jexcel(document.getElementById("planningUnitList"), options);
                this.el = elVar;
            }).catch(
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
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    /**
     * Renders the pipeline program import negative inventory details screen.
     * @returns {JSX.Element} - Pipeline program import negative inventory details screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <>
                <Card>
                    <CardBody className="pt-lg-0">
                        <div className="table-responsive consumptionDataEntryTable" >
                            <div id="planningUnitList">
                            </div>
                        </div>
                    </CardBody>
                    <CardFooter>
                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </CardFooter>
                </Card>
            </>
        );
    }
    /**
     * Redirects to pipeline program import list on cancel button clicked
     */
    cancelClicked() {
        this.props.history.push(`/pipeline/pieplineProgramList`);
    }
}
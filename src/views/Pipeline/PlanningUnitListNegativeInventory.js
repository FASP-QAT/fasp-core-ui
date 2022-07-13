import React, { Component } from 'react';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import i18n from '../../i18n';
import PipelineService from '../../api/PipelineService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Card, CardHeader, CardBody, CardFooter, Button } from 'reactstrap';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
import { JEXCEL_PRO_KEY } from '../../Constants';

export default class PlanningUnitListNegativeInventory extends Component {

    constructor(props) {
        super(props);
        this.cancelClicked = this.cancelClicked.bind(this);
    }
    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
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
                // this.el.destroy();
                jexcel.destroy(document.getElementById("planningUnitList"), true);

                var json = [];
                var data = dataArray;
                var options = {
                    data: data,
                    columnDrag: true,
                    colWidths: [300, 70],
                    columns: [
                        {
                            title: i18n.t('static.report.planningUnit'),
                            type: 'text',
                            readOnly: true
                        },
                        {
                            title: i18n.t('static.inventory.totalInvontory'),
                            type: 'numeric',
                            readOnly: true

                        }

                    ],
                    pagination: false,
                    search: true,
                    columnSorting: true,
                    tableOverflow: true,
                    wordWrap: true,
                    // paginationOptions: [10, 25, 50, 100],
                    // position: 'top',
                    allowInsertColumn: false,
                    allowManualInsertColumn: false,
                    allowDeleteRow: false,
                    onchange: this.changed,
                    oneditionend: this.onedit,
                    copyCompatibility: true,
                    text: {
                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                        show: '',
                        entries: '',
                    },
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

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    render() {
        return (
            <>
                <Card>
                    {/* <CardHeader>
                        <strong>Planning Unit List</strong>
                    </CardHeader> */}
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

    cancelClicked() {
        this.props.history.push(`/pipeline/pieplineProgramList`);
    }

}
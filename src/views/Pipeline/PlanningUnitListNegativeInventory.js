import React, { Component } from 'react';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';
import PipelineService from '../../api/PipelineService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Card, CardHeader, CardBody, CardFooter, Button } from 'reactstrap';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'

export default class PlanningUnitListNegativeInventory extends Component {

    constructor(props) {
        super(props);
        this.cancelClicked = this.cancelClicked.bind(this);
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
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
                this.el.destroy();
                var json = [];
                var data = dataArray;
                var options = {
                    data: data,
                    columnDrag: true,
                    colWidths: [300, 70],
                    columns: [
                        {
                            title: 'Planning Unit',
                            type: 'text',
                            readOnly: true
                        },
                        {
                            title: 'Total Inventory',
                            type: 'number',
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

                };
                var elVar = jexcel(document.getElementById("planningUnitList"), options);
                this.el = elVar;

            });
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
                        <div className="table-responsive" >
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
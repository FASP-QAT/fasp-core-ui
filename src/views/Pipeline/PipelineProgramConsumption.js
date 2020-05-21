import React, { Component } from 'react';
import jexcel from 'jexcel';
import i18n from '../../i18n';
export default class PipelineProgramConsumption extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.el = jexcel(document.getElementById("consumptiontableDiv"), '');
        this.el.destroy();
        var json = [];
        // var data = consumptionDataArr;
        var data = [{}, {}, {}, {}, {}];
        // json[0] = data;
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [130, 130, 120, 120, 100, 100, 100, 100],
            columns: [
                // { title: 'Month', type: 'text', readOnly: true },
                {
                    title: 'Consumption Date',
                    type: 'calendar',
                    options: {
                        format: 'MM-YYYY'
                    }
                },
                {
                    title: i18n.t('static.inventory.region'),
                    type: 'dropdown',
                    // source: regionList
                },
                {
                    title: i18n.t('static.consumption.consumptionqty'),
                    type: 'numeric'
                },
                {
                    title: i18n.t('static.consumption.daysofstockout'),
                    type: 'numeric'
                },
                {
                    title: i18n.t('static.inventory.dataSource'),
                    type: 'dropdown',
                    // source: dataSourceList
                },
                {
                    title: 'Notes',
                    type: 'text'
                },
                {
                    title: i18n.t('static.consumption.actualflag'),
                    type: 'dropdown',
                    source: [{ id: true, name: i18n.t('static.consumption.actual') }, { id: false, name: i18n.t('static.consumption.forcast') }]
                },
                {
                    title: i18n.t('static.common.active'),
                    type: 'checkbox'
                },
                {
                    title: 'Index',
                    type: 'hidden'
                }



                // { title: 'Create date', type: 'text', readOnly: true },
                // { title: 'Created By', type: 'text', readOnly: true },
                // { title: 'Last Modified date', type: 'text', readOnly: true },
                // { title: 'Last Modified by', type: 'text', readOnly: true }
            ],
            pagination: 10,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onchange: this.changed,
            oneditionend: this.onedit,
            copyCompatibility: true,
            // paginationOptions: [10, 25, 50, 100],
            position: 'top'
        };

        this.el = jexcel(document.getElementById("consumptiontableDiv"), options);
    }
    render() {
        return (
            <>
                <h4 className="red">{this.props.message}</h4>
                <div className="table-responsive" >

                    <div id="consumptiontableDiv">
                    </div>
                </div>
            </>
        );
    }
}
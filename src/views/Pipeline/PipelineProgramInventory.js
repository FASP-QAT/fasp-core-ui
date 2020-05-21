import React, { Component } from 'react';
import jexcel from 'jexcel';
import i18n from '../../i18n';

export default class PipelineProgramInventory extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.el = jexcel(document.getElementById("inventorytableDiv"), '');
        this.el.destroy();
        var json = [];
        // var data = inventoryDataArr;
        var data = [{}, {}, {}, {}, {}];
        // json[0] = data;
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 130, 130, 130, 130],
            columns: [

                {
                    title: i18n.t('static.inventory.dataSource'),
                    type: 'dropdown',
                    // source: dataSourceList
                },
                {
                    title: i18n.t('static.inventory.region'),
                    type: 'dropdown',
                    // source: regionList
                    // readOnly: true
                },
                {
                    title: i18n.t('static.inventory.inventoryDate'),
                    type: 'calendar',
                    options: { format: 'MM-YYYY' }

                },
                {
                    title: i18n.t('static.inventory.expectedStock'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.inventory.manualAdjustment'),
                    type: 'text'
                },
                {
                    title: i18n.t('static.inventory.actualStock'),
                    type: 'text'
                },
                // {
                //     title: i18n.t('static.inventory.batchNumber'),
                //     type: 'text'
                // },
                // {
                //     title: i18n.t('static.inventory.expireDate'),
                //     type: 'calendar'

                // },
                {
                    title: i18n.t('static.inventory.active'),
                    type: 'checkbox'
                },
                {
                    title: 'Index',
                    type: 'hidden'
                }

            ],
            pagination: 10,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            // paginationOptions: [10, 25, 50, 100],
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onchange: this.changed,
            oneditionend: this.onedit,
            copyCompatibility: true

        };

        this.el = jexcel(document.getElementById("inventorytableDiv"), options);
    }

    render() {
        return (
            <>
                <div className="table-responsive" >

                    <div id="inventorytableDiv">
                    </div>
                </div>
            </>
        );
    }
}
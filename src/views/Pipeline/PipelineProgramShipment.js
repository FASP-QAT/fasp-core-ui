import React, { Component } from 'react';
import jexcel from 'jexcel';
import i18n from '../../i18n';
import PipelineService from '../../api/PipelineService';
import AuthenticationService from '../Common/AuthenticationService';
import DataSourceService from '../../api/DataSourceService';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProcurementAgentService from '../../api/ProcurementAgentService';
import ProcurementUnitService from '../../api/ProcurementUnitService';
import ManufaturerService from '../../api/SupplierService';
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import ShipmentStatusService from '../../api/ShipmentStatusService';

export default class PipelineProgramShipment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pipelineShipmentData: [],
            dataSourceList: [],
            planningUnitList: [],
            procurementAgentList: [],
            procurementUnitList: [],
            supplierList: [],
            shipModes: ["Air", "Sea"],
            shipmentStatusList:[],
            lang: localStorage.getItem('lang'),

        }

        this.initialiseshipment = this.initialiseshipment.bind(this)
    }

    componentDidMount() {
        ShipmentStatusService.getShipmentStatusListActive()
        .then(response => {
            if (response.status == 200) {
               // console.log(response.data)
                this.setState({
                    shipmentStatusList: response.data.map(ele=>({name:getLabelText(ele.label,this.state.lang),
                        id:ele.shipmentStatusId}))
                })
            } else {
                this.setState({
                    message: response.data.messageCode
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


      //   console.log("pipelineProgramId----->", this.props.match.params.pipelineId);
        AuthenticationService.setupAxiosInterceptors();
       
        DataSourceService.getAllDataSourceList()
            .then(response => {
                if (response.status == 200) {
                   // console.log(response.data)
                    this.setState({
                        dataSourceList: response.data.map(ele=>({name:getLabelText(ele.label,this.state.lang),
                            id:ele.dataSourceId}))
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
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

            ProcurementAgentService.getProcurementAgentListAll()
            .then(response => {
                if (response.status == 200) {
                    console.log(response.data)
                    this.setState({
                        procurementAgentList: response.data.map(ele=>({name:getLabelText(ele.label,this.state.lang),
                            id:ele.procurementAgentId}))
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
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
       
       
            ManufaturerService.getSupplierListAll()
            .then(response => {
                if (response.status == 200) {
                    console.log(response.data)
                    this.setState({
                        supplierList: response.data.map(ele=>({name:getLabelText(ele.label,this.state.lang),
                            id:ele.supplierId}))
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
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
        PlanningUnitService.getAllPlanningUnitList()
            .then(response => {
                if (response.status == 200) {
                   // console.log(response.data)
                    this.setState({
                        planningUnitList: response.data.map(ele=>({name:getLabelText(ele.label,this.state.lang),
                            id:ele.planningUnitId}))
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
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
        ProcurementUnitService.getProcurementUnitList()
            .then(response => {
                if (response.status == 200) {
                    console.log(response.data)
                    this.setState({
                        procurementUnitList: response.data.map(ele=>({name:getLabelText(ele.label,this.state.lang),
                            id:ele.procurementUnitId}))
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
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
        
            PipelineService.getShipmentDataById(1)
            .then(response => {
                if (response.status == 200) {
                   // console.log(response.data)
                    this.setState({
                        pipelineShipmentData: response.data
                    })
                    this.initialiseshipment();
                } else {
                    this.setState({
                        message: response.data.messageCode
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

    }
    initialiseshipment() {
        this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
        this.el.destroy();
        var json = [];
        // var data = shipmentDataArr;

        var shipmentdata = [];

        if (this.state.pipelineShipmentData.length != 0) {

            shipmentdata = this.state.pipelineShipmentData.map((item, index) => ["", "", "", item.shipamount, "", "", "",  item.shipamount, "", "", item.shipfreightcost, moment(item.shipordereddate).format("MM-DD-YYYY"), moment(item.shipshippeddate).format("MM-DD-YYYY"), moment(item.shipreceiveddate).format("MM-DD-YYYY"), "",item.shipnote, true])
            console.log(shipmentdata)
        }


       




        var data = shipmentdata;
        // json[0] = data;
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
            columns: [

                {
                    title: i18n.t('static.datasource.datasource'),
                    type: 'dropdown',
                    source: this.state.dataSourceList
                },
                {
                    title: i18n.t('static.dashboard.planningunit'),
                    type: 'dropdown',
                     source: this.state.planningUnitList    
                    // readOnly: true
                },
                {
                    title: i18n.t('static.shipment.edd'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                },
                {
                    title: i18n.t('static.shipment.suggestedQty'),
                    type: 'text',
                    // source: regionList
                    // readOnly: true
                }, {
                    title: i18n.t('static.dashboard.procurementagent'),
                    type: 'dropdown',
                     source: this.state.procurementAgentList
                }, {
                    title: i18n.t('static.dashboard.procurementUnit'),
                    type: 'dropdown',
                     source: this.state.procurementUnitList
                }, {
                    title: i18n.t('static.dashboard.supplier'),
                    type: 'dropdown',
                     source: this.state.supplierList
                }, {
                    title: i18n.t('static.shipment.qty'),
                    type: 'text',
                    // source: regionList
                    // readOnly: true
                }, {
                    title: i18n.t('static.shipment.rate'),
                    type: 'text',
                    // source: regionList
                    // readOnly: true
                }, {
                    title: i18n.t('static.shipment.mode'),
                    type: 'dropdown',
                    source: this.state.shipModes
                }, {
                    title: i18n.t('static.shipment.freightcost'),
                    type: 'text',
                    // source: dataSourceList
                },
                {
                    title: i18n.t('static.shipment.ordereddate'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                }, {
                    title: i18n.t('static.shipment.shipdate'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                }, {
                    title: i18n.t('static.shipment.receiveddate'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                },
                {
                    title: i18n.t('static.shipmentStatus.shipmentStatusName'),
                    type: 'dropdown',
                   source:this.state.shipmentStatusList
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text'
                }, {
                    title: i18n.t('static.common.active'),
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

        this.el = jexcel(document.getElementById("shipmenttableDiv"), options);

    }

    render() {

        return (
            <>
                <div className="table-responsive" >

                    <div id="shipmenttableDiv">
                    </div>
                </div>
            </>
        );
    }
}
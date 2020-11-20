import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Modal, ModalBody, ModalFooter, ModalHeader, Row, Badge, Button, Collapse } from 'reactstrap';
import openingbalance from '../../assets/img/Opening-balance-formula.png';
import endingbalance from '../../assets/img/Ending balance-formula.png';
import amc from '../../assets/img/AMC-Formula.png';
import minstock from '../../assets/img/Min-Formula.png';
import maxstock from '../../assets/img/Max-Formula.png';
import minmonthstock from '../../assets/img/Min-Months-Of-Stock-formula.png';
import maxmonthstock from '../../assets/img/Max-Months-Of-Stock-formula.png';
import suggestorder from '../../assets/img/suggest order-Formula.png';
import suggestorderqty from '../../assets/img/suggest order qty-Formula.png';
import mos from '../../assets/img/Month0fstock-Formula.png';
import costOfinventory from '../../assets/img/Cost-Of-Inventory.png';
import Inventoryturns from '../../assets/img/Inventory Turns.png';
import forcasterror from '../../assets/img/ForecastError-Formula.png';
import shipmentcost from '../../assets/img/Shipment-cost-formula.png';
import i18n from '../../i18n';

class SupplyPlanFormulas extends Component {

    constructor(props) {
        super(props);

        // this.toggle = this.toggle.bind(this);
        this.state = {
            activeTab: 1,
            accordion: [true, true, true],
            collapse: true,
            modal: false,
            large: false,
            small: false,
            info: false,
            costofinventory: false,
            forecastmatrix: false,
            stockstatusovertime: false,
            inventoryturns: false,
            stockstatus: false,
            stockstatusacrossplaningunit: false,
            shipmentcost: false,
            stockstatusmatrix: false,
        };
        this.toggle = this.toggle.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this.toggleSmall = this.toggleSmall.bind(this);
        this.toggleInfo = this.toggleInfo.bind(this);
        this.togglecostOfInventory = this.togglecostOfInventory.bind(this);
        this.toggleForecastMatrix = this.toggleForecastMatrix.bind(this);
        this.toggleStockStatusOverTime = this.toggleStockStatusOverTime.bind(this);
        this.toggleInventoryTurns = this.toggleInventoryTurns.bind(this);
        this.toggleStockStatus = this.toggleStockStatus.bind(this);
        this.toggleStockStatusAcrossPlaningUnit = this.toggleStockStatusAcrossPlaningUnit.bind(this);
        this.toggleShippmentCost = this.toggleShippmentCost.bind(this);
        this.toggleStockStatusMatrix = this.toggleStockStatusMatrix.bind(this);
    }

    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }
    toggle() {
        this.setState({
            modal: !this.state.modal,
        });
    }

    toggleLarge() {
        this.setState({
            large: !this.state.large,
        });
    }

    toggleSmall() {
        this.setState({
            small: !this.state.small,
        });
    }
    toggleInfo() {
        this.setState({
            info: !this.state.info,
        });
    }
    togglecostOfInventory() {
        this.setState({
            costofinventory: !this.state.costofinventory,
        });
    }
    toggleForecastMatrix() {
        this.setState({
            forecastmatrix: !this.state.forecastmatrix,
        });
    }
    toggleStockStatusOverTime() {
        this.setState({
            stockstatusovertime: !this.state.stockstatusovertime,
        });
    }
    toggleInventoryTurns() {
        this.setState({
            inventoryturns: !this.state.inventoryturns,
        });
    }
    toggleStockStatus() {
        this.setState({
            stockstatus: !this.state.stockstatus,
        });
    }
    toggleStockStatusAcrossPlaningUnit() {
        this.setState({
            stockstatusacrossplaningunit: !this.state.stockstatusacrossplaningunit,
        });
    }
    toggleShippmentCost() {
        this.setState({
            shipmentcost: !this.state.shipmentcost,
        });
    }
    toggleStockStatusMatrix() {
        this.setState({
            stockstatusmatrix: !this.state.stockstatusmatrix,
        });
    }

    render() {
        return (
            <div className="animated fadeIn">
                {/* 
        <Row>
          <Col sm="12" xl="12">
            <h5></h5>
            <Card>
              <CardBody>
              <Button onClick={this.toggle} className="mr-1">Launch demo modal</Button> */}
                {/*Supply plan formuale */}
                <Modal isOpen={this.state.modal} className={'modal-xl ' + this.props.className} >
                    <ModalHeader toggle={this.toggle} className="ModalHead modal-info-Headher"><strong className="TextWhite" >{i18n.t('static.report.problemReportStatusDetails')}</strong></ModalHeader>
                    <ModalBody >
                        <ListGroup style={{ height: '490px', overflowY: 'scroll' }}>
                            <h5><span className="formulastext-p"><b>{i18n.t('static.problemReport.issueStatus')}</b></span></h5>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.inCompliance')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">

                                    <p><span className="">{i18n.t('static.problemReport.inComplianceDesc')}</span></p>
                                    <p><span className="formulastext-p">{i18n.t('static.common.example')} :</span><br></br>

                                        {i18n.t('static.problemReport.inComplianceExample')}</p>
                                    {/* AMC = AVG(Consumption in last 3 months, current month,future 2 months)(Not based on program) */}
                                </ListGroupItemText>
                            </ListGroupItem>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.resolved')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">

                                    <p><span className="">{i18n.t('static.problemReport.resolvedDesc')}</span></p>
                                    <p><span className="formulastext-p">{i18n.t('static.common.example')} :</span><br></br>

                                        {i18n.t('static.problemReport.resolvedExample')}</p>
                                    {/* AMC = AVG(Consumption in last 3 months, current month,future 2 months)(Not based on program) */}
                                </ListGroupItemText>
                            </ListGroupItem>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.addressed')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">

                                    <p><span className="">{i18n.t('static.problemReport.addressedDesc')}</span></p>
                                    <p><span className="formulastext-p">{i18n.t('static.common.example')} :</span><br></br>

                                        {i18n.t('static.problemReport.addressedExample')}</p>
                                    {/* AMC = AVG(Consumption in last 3 months, current month,future 2 months)(Not based on program) */}
                                </ListGroupItemText>
                            </ListGroupItem>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.open')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">

                                    <p><span className="">{i18n.t('static.problemReport.openDesc')}</span></p>
                                    <p><span className="formulastext-p">{i18n.t('static.common.example')} :</span><br></br>

                                        {i18n.t('static.problemReport.openExample')}</p>
                                    {/* AMC = AVG(Consumption in last 3 months, current month,future 2 months)(Not based on program) */}
                                </ListGroupItemText>
                            </ListGroupItem><br></br>

                        {/* </ListGroup> */}

                        {/* <ListGroup style={{ height: '490px', overflowY: 'scroll' }}> */}
                            <h5><span className="formulastext-p"><b>{i18n.t('static.problemReport.issueReviewStatus')}</b></span></h5>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.reviewed')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">

                                    <p><span className="">{i18n.t('static.problemReport.reviewedDesc')}</span></p>
                                </ListGroupItemText>
                            </ListGroupItem><br></br>
                        {/* </ListGroup> */}

                        {/* <ListGroup style={{ height: '490px', overflowY: 'scroll' }}> */}
                            <h5><span className="formulastext-p"><b>{i18n.t('static.problemReport.supplyPlanStatus')}</b></span></h5>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.rejected')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">

                                    <p><span className="">{i18n.t('static.problemReport.rejectedDesc')}</span></p>
                                </ListGroupItemText>
                            </ListGroupItem>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.approved')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">

                                    <p><span className="">{i18n.t('static.problemReport.approvedDesc')}</span></p>
                                </ListGroupItemText>
                            </ListGroupItem>
                        </ListGroup>

                    </ModalBody>

                </Modal>

            </div>
        );
    }
}

export default SupplyPlanFormulas;

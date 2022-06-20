import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Modal, ModalBody, ModalFooter, ModalHeader, Row, Badge, Button, Collapse } from 'reactstrap';
import openingbalance from '../../assets/img/Opening-balance-formula.png';
import endingbalance from '../../assets/img/Ending balance-formula.png';
import exipredStock from '../../assets/img/ExpiredStock.png';
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
      showtermslogic:false,
    };
    this.toggle = this.toggle.bind(this);
    this.toggleLarge = this.toggleLarge.bind(this);
    this.toggleSmall = this.toggleSmall.bind(this);
    this.toggleInfo = this.toggleInfo.bind(this);
    this.togglecostOfInventory = this.togglecostOfInventory.bind(this);
    this.toggleForecastMatrix = this.toggleForecastMatrix.bind(this);
    this.toggleForecastMatrix1 = this.toggleForecastMatrix1.bind(this);
    this.toggleStockStatusOverTime = this.toggleStockStatusOverTime.bind(this);
    this.toggleInventoryTurns = this.toggleInventoryTurns.bind(this);
    this.toggleStockStatus = this.toggleStockStatus.bind(this);
    this.toggleStockStatusAcrossPlaningUnit = this.toggleStockStatusAcrossPlaningUnit.bind(this);
    this.toggleShippmentCost = this.toggleShippmentCost.bind(this);
    this.toggleStockStatusMatrix = this.toggleStockStatusMatrix.bind(this);
    this.toggleShowTermLogic = this.toggleShowTermLogic.bind(this);
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
  toggleForecastMatrix1() {
    this.setState({
      forecastmatrix1: !this.state.forecastmatrix1,
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

  toggleShowTermLogic() {
    this.setState({
      showtermslogic: !this.state.showtermslogic,
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
          <ModalHeader toggle={this.toggle} className="ModalHead modal-info-Headher"><strong className="TextWhite" >{i18n.t('static.common.formulae')}</strong></ModalHeader>
          <ModalBody >
            <ListGroup style={{ height: '490px', overflowY: 'scroll' }}>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t('static.supplyPlan.openingBalance')}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img src={openingbalance} className="formula-img-mr img-fluid" />

                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>

                    {i18n.t("static.supplyPlanFormula.openingBalanceEx1") + " = 10,653"}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.openingBalanceEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.openingBalanceEx3") + " = 10,653"}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.endingBalance") + " / " + i18n.t("static.supplyPlan.unmetDemandStr")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img className="formula-img-mr img-fluid" src={endingbalance} /><br></br>
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.openingBalanceFormula") + " = 1,653"}<br></br>
                    {i18n.t("static.supplyPlan.adjustments") + " = -100"}<br></br>
                    {i18n.t("static.dashboard.shipments") + " = 5,176"}<br></br>
                    {i18n.t("static.supplyPlan.consumption") + " =7,087"}<br></br>
                    {i18n.t("static.supplyPlanFormula.expiredStock") + " = 642"}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.endingBalance1")}<br></br>
                    {i18n.t("static.supplyPlan.projectedInventory") + " = 1,653 + (-100) + 5,176 - 7,087 - 642"}<br></br>
                    {i18n.t("static.supplyPlan.projectedInventory") + " = -1000"}<br></br>
                    {i18n.t("static.supplyPlanFormula.endingBalanceFormula") + " = 0"}<br></br>
                    {i18n.t("static.supplyPlan.unmetDemandStr") + " = 0 - " + i18n.t("static.supplyPlan.projectedInventory")}<br></br>
                    {i18n.t("static.supplyPlan.unmetDemandStr") + " = 0 - (-1,000)"}<br></br>
                    {i18n.t("static.supplyPlan.unmetDemandStr") + " = 1,000)"}</p>
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.openingBalanceFormula") + " = 9,999"}<br></br>
                    {i18n.t("static.supplyPlan.adjustments") + " = -100"}<br></br>
                    {i18n.t("static.dashboard.shipments") + " = 5,176"}<br></br>
                    {i18n.t("static.supplyPlan.consumption") + " =7,087"}<br></br>
                    {i18n.t("static.supplyPlanFormula.expiredStock") + " = 642"}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.endingBalance1")}<br></br>
                    {i18n.t("static.supplyPlan.projectedInventory") + " = 9,999 + (-100) + 5,176 - 7,087 - 642"}<br></br>
                    {i18n.t("static.supplyPlan.projectedInventory") + " = 7,346"}<br></br>
                    {i18n.t("static.supplyPlanFormula.endingBalanceFormula") + " = 7,346"}<br></br>
                    {i18n.t("static.supplyPlan.unmetDemandStr") + " = " + i18n.t('static.supplyPlanFormula.na')}</p>
                  {/* AMC = AVG(Consumption in last 3 months, current month,future 2 months)(Not based on program) */}
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlanFormula.expiredStock")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={exipredStock} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.expiredStockEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.expiredStockEx2")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.expiredStockEx")}<br></br>
                    {i18n.t("static.supplyPlanFormula.expiredStockEx3")}</p>
                  <p>
                    <span className="formulastext-p">{i18n.t("static.program.notes") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.expiredStockNote")}
                  </p>
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlanFormula.amc")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img className="formula-img-mr img-fluid" src={amc} /><br></br>
                  <p>{i18n.t("static.supplyPlanFormula.amcNote")}</p>
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx1')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx2')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx3')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx4')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx5')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx6')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx7')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx8')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx9')}<br></br>

                    <br></br>
                    {i18n.t("static.supplyPlanFormula.amcEx10")}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx11')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx12')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx13')}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.minStock")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img className="formula-img-mr img-fluid" src={minstock} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.minStockEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.minStockEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.minStockEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.minStockEx4")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.minStockEx5")}<br></br>
                    {i18n.t("static.supplyPlanFormula.minStockEx6")}<br></br>
                    {i18n.t("static.supplyPlanFormula.minStockEx7")}<br></br>
                    {i18n.t("static.supplyPlanFormula.minStockEx8")}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.maxStock")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  {/* Max = AMC * MIN(MAX(MIN_MONTHS_OF_STOCK,3)+REORDER_FREQUENCY,18) */}
                  <img className="formula-img-mr img-fluid" src={maxstock} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx4")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx5")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx6")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx7")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx8")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx9")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx10")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx11")}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t('static.supplyPlan.minMonthsOfStock')}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={minmonthstock} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.minMonthOfStockEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.minMonthOfStockEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.minMonthOfStockEx3")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.minMonthOfStockEx4")}<br></br>
                    {i18n.t("static.supplyPlanFormula.minMonthOfStockEx5")}<br></br>
                    {i18n.t("static.supplyPlanFormula.minMonthOfStockEx6")}</p>
                </ListGroupItemText>
              </ListGroupItem>

              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlanFormula.maxMonthOfStock")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={maxmonthstock} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.minMonthOfStockEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.minMonthOfStockEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx4")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.maxMonthOfStockEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxMonthOfStockEx2")} <br></br>
                    {i18n.t("static.supplyPlanFormula.maxMonthOfStockEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxMonthOfStockEx4")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxMonthOfStockEx5")}</p>
                </ListGroupItemText>
              </ListGroupItem>

              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlanFormula.whenToSuggest")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={suggestorder} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.suggestShipmentEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.suggestShipmentEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.suggestShipmentEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.suggestShipmentEx4")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.suggestShipmentEx5")}<br></br><br></br>
                    {i18n.t("static.supplyPlanFormula.whenToSuggestEx3")}

                  </p>
                </ListGroupItemText>
              </ListGroupItem>

              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlanFormula.suggestedOrderQty")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={suggestorderqty} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx2")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx4")}<br></br>
                    {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx5")}</p>
                </ListGroupItemText>
              </ListGroupItem>

              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.monthsOfStock")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={mos} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.amcEx13")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx4")}</p>
                </ListGroupItemText>
              </ListGroupItem>

            </ListGroup>

          </ModalBody>

        </Modal>
        {/*Cost Of Inventory formuale */}
        <Modal isOpen={this.state.costofinventory} className={'modal-lg ' + this.props.className} >
          <ModalHeader toggle={this.togglecostOfInventory} className="ModalHead modal-info-Headher"><strong className="TextWhite">{i18n.t("static.common.formulae")}</strong></ModalHeader>
          <ModalBody >
            <ListGroup>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.dashboard.costOfInventory")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={costOfinventory} />
                  <p>{i18n.t("static.supplyPlanFormula.costOfInventoryNote")}</p>
                </ListGroupItemText>
              </ListGroupItem>
            </ListGroup>
          </ModalBody>
        </Modal>
        {/*Inventory Turns formuale */}
        <Modal isOpen={this.state.inventoryturns} className={'modal-lg ' + this.props.className} >
          <ModalHeader toggle={this.toggleInventoryTurns} className="ModalHead modal-info-Headher"><strong>{i18n.t("static.common.formulae")}</strong></ModalHeader>
          <ModalBody >
            <ListGroup>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.dashboard.inventoryTurns")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img className="formula-img-mr img-fluid" src={Inventoryturns} />
                  <p>{i18n.t("static.supplyPlanFormula.costOfInventoryNote")}</p>

                  <p>{i18n.t("static.supplyPlanFormula.inventoryTurnsNote")}</p>

                </ListGroupItemText>
              </ListGroupItem>
            </ListGroup>
          </ModalBody>
        </Modal>
        {/*Forcast Matrix formuale */}
        <Modal isOpen={this.state.forecastmatrix} className={'modal-xl ' + this.props.className} >
          <ModalHeader toggle={this.toggleForecastMatrix} className="ModalHead modal-info-Headher"><strong className="TextWhite">{i18n.t("static.common.formulae")}</strong></ModalHeader>
          <ModalBody >
            <ListGroup>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.report.wapeFormula")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img className="formula-img-mr img-fluid" src={forcasterror} /><br></br>
                  <p>{"1) " + i18n.t('static.report.forecastErrorMonthlyFormula1')}</p>
                  <p>{"2) " + i18n.t('static.report.forecastErrorMonthlyFormula2')}</p>
                  <p>{"3) " + i18n.t('static.report.forecastErrorMonthlyFormula3')}</p>
                  <p>{"4) " + i18n.t('static.report.forecastErrorMonthlyFormula4')}</p>
                  <p>{i18n.t("static.report.wapeFormulaNote")}</p>
                </ListGroupItemText>
              </ListGroupItem>
            </ListGroup>
          </ModalBody>
        </Modal>
        {/*Forcast Matrix formuale 1*/}
        <Modal isOpen={this.state.forecastmatrix1} className={'modal-xl ' + this.props.className} >
          <ModalHeader toggle={this.toggleForecastMatrix1} className="ModalHead modal-info-Headher"><strong className="TextWhite">{i18n.t("static.common.formulae")}</strong></ModalHeader>
          <ModalBody >
            <ListGroup>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.report.wapeFormula")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img className="formula-img-mr img-fluid" src={forcasterror} /><br></br>
                  <p>{"1) " + i18n.t('static.report.forecastErrorMonthlyFormula1')}</p>
                  <p>{"2) " + i18n.t('static.report.forecastErrorMonthlyFormula5')}</p>
                  <p>{"3) " + i18n.t('static.report.forecastErrorMonthlyFormula6')}</p>
                  <p>{"4) " + i18n.t('static.report.forecastErrorMonthlyFormula7')}</p>
                  <p>{"5) " + i18n.t('static.report.forecastErrorMonthlyFormula4')}</p>
                  <p>{i18n.t("static.report.wapeFormulaNote")}</p>
                </ListGroupItemText>
              </ListGroupItem>
            </ListGroup>
          </ModalBody>
        </Modal>
        {/*Stock Status matrix*/}
        <Modal isOpen={this.state.stockstatusmatrix} className={'modal-xl ' + this.props.className} >
          <ModalHeader toggle={this.toggleStockStatusMatrix} className="ModalHead modal-info-Headher"><strong className="TextWhite">{i18n.t("static.common.formulae")}</strong></ModalHeader>
          <ModalBody >
            <ListGroup style={{ height: '300px', overflowY: 'scroll' }}>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlanFormula.amc")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img className="formula-img-mr img-fluid" src={amc} /><br></br>
                  <p>{i18n.t("static.supplyPlanFormula.amcNote")}</p>
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx1')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx2')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx3')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx4')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx5')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx6')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx7')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx8')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx9')}<br></br>

                    <br></br>
                    {i18n.t("static.supplyPlanFormula.amcEx10")}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx11')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx12')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx13')}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.monthsOfStock")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={mos} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.amcEx13")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx4")}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <div className="mt-2" >
                <p>{i18n.t("static.supplyPlanFormula.costOfInventoryNote")}</p>
              </div>
            </ListGroup>
          </ModalBody>
        </Modal>
        {/*Stock Status Over Time formuale */}
        <Modal isOpen={this.state.stockstatusovertime} className={'modal-xl ' + this.props.className} >
          <ModalHeader toggle={this.toggleStockStatusOverTime} className="ModalHead modal-info-Headher"><strong className="TextWhite">{i18n.t("static.common.formulae")}</strong></ModalHeader>
          <ModalBody >
            <ListGroup style={{ height: '300px', overflowY: 'scroll' }}>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlanFormula.amc")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img className="formula-img-mr img-fluid" src={amc} /><br></br>
                  <p>{i18n.t("static.supplyPlanFormula.amcNote")}</p>
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx1')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx2')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx3')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx4')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx5')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx6')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx7')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx8')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx9')}<br></br>

                    <br></br>
                    {i18n.t("static.supplyPlanFormula.amcEx10")}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx11')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx12')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx13')}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.monthsOfStock")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={mos} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.amcEx13")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx4")}</p>
                </ListGroupItemText>
              </ListGroupItem>
            </ListGroup>
          </ModalBody>
        </Modal>
        {/*Stock Status formuale */}
        <Modal isOpen={this.state.stockstatus} className={'modal-xl ' + this.props.className} >
          <ModalHeader toggle={this.toggleStockStatus} className="ModalHead modal-info-Headher"><strong className="TextWhite">{i18n.t("static.common.formulae")}</strong></ModalHeader>
          <ModalBody >
            <ListGroup style={{ height: '300px', overflowY: 'scroll' }}>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlanFormula.amc")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img className="formula-img-mr img-fluid" src={amc} /><br></br>
                  <p>{i18n.t("static.supplyPlanFormula.amcNote")}</p>
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx1')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx2')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx3')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx4')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx5')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx6')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx7')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx8')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx9')}<br></br>

                    <br></br>
                    {i18n.t("static.supplyPlanFormula.amcEx10")}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx11')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx12')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx13')}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.monthsOfStock")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={mos} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.amcEx13")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx4")}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.maxStock")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  {/* Max = AMC * MIN(MAX(MIN_MONTHS_OF_STOCK,3)+REORDER_FREQUENCY,18) */}
                  <img className="formula-img-mr img-fluid" src={maxstock} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx4")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx5")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx6")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx7")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx8")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx9")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx10")}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx11")}</p>
                </ListGroupItemText>
              </ListGroupItem>
            </ListGroup>
          </ModalBody>
        </Modal>


        {/*Stock Status Across Planning Units formuale */}
        <Modal isOpen={this.state.stockstatusacrossplaningunit} className={'modal-xl ' + this.props.className} >
          <ModalHeader toggle={this.toggleStockStatusAcrossPlaningUnit} className="ModalHead modal-info-Headher"><strong className="TextWhite">{i18n.t("static.common.formulae")}</strong></ModalHeader>
          <ModalBody >
            <ListGroup style={{ height: '300px', overflowY: 'scroll' }}>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlanFormula.amc")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img className="formula-img-mr img-fluid" src={amc} /><br></br>
                  <p>{i18n.t("static.supplyPlanFormula.amcNote")}</p>
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx1')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx2')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx3')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx4')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx5')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx6')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx7')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx8')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx9')}<br></br>

                    <br></br>
                    {i18n.t("static.supplyPlanFormula.amcEx10")}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx11')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx12')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx13')}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.monthsOfStock")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={mos} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.amcEx13")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx4")}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.endingBalance") + " / " + i18n.t("static.supplyPlan.unmetDemandStr")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img className="formula-img-mr img-fluid" src={endingbalance} /><br></br>
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.openingBalanceFormula") + " = 1,653"}<br></br>
                    {i18n.t("static.supplyPlan.adjustments") + " = -100"}<br></br>
                    {i18n.t("static.dashboard.shipments") + " = 5,176"}<br></br>
                    {i18n.t("static.supplyPlan.consumption") + " =7,087"}<br></br>
                    {i18n.t("static.supplyPlanFormula.expiredStock") + " = 642"}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.endingBalance1")}<br></br>
                    {i18n.t("static.supplyPlan.projectedInventory") + " = 1,653 + (-100) + 5,176 - 7,087 - 642"}<br></br>
                    {i18n.t("static.supplyPlan.projectedInventory") + " = -1000"}<br></br>
                    {i18n.t("static.supplyPlanFormula.endingBalanceFormula") + " = 0"}<br></br>
                    {i18n.t("static.supplyPlan.unmetDemandStr") + " = 0 - " + i18n.t("static.supplyPlan.projectedInventory")}<br></br>
                    {i18n.t("static.supplyPlan.unmetDemandStr") + " = 0 - (-1,000)"}<br></br>
                    {i18n.t("static.supplyPlan.unmetDemandStr") + " = 1,000)"}</p>
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.openingBalanceFormula") + " = 9,999"}<br></br>
                    {i18n.t("static.supplyPlan.adjustments") + " = -100"}<br></br>
                    {i18n.t("static.dashboard.shipments") + " = 5,176"}<br></br>
                    {i18n.t("static.supplyPlan.consumption") + " =7,087"}<br></br>
                    {i18n.t("static.supplyPlanFormula.expiredStock") + " = 642"}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.endingBalance1")}<br></br>
                    {i18n.t("static.supplyPlan.projectedInventory") + " = 9,999 + (-100) + 5,176 - 7,087 - 642"}<br></br>
                    {i18n.t("static.supplyPlan.projectedInventory") + " = 7,346"}<br></br>
                    {i18n.t("static.supplyPlanFormula.endingBalanceFormula") + " = 7,346"}<br></br>
                    {i18n.t("static.supplyPlan.unmetDemandStr") + " = " + i18n.t('static.supplyPlanFormula.na')}</p>
                  {/* AMC = AVG(Consumption in last 3 months, current month,future 2 months)(Not based on program) */}
                </ListGroupItemText>
              </ListGroupItem>
              <div className="mt-2">
                <p>{i18n.t("static.supplyPlanFormula.costOfInventoryNote")}</p>
              </div>
            </ListGroup>
          </ModalBody>
        </Modal>

        {/*Shipment Cost formuale */}
        <Modal isOpen={this.state.shipmentcost} className={'modal-lg ' + this.props.className} >
          <ModalHeader toggle={this.toggleShippmentCost} className="ModalHead modal-info-Headher"><strong className="TextWhite">{i18n.t("static.common.formulae")}</strong></ModalHeader>
          <ModalBody >
            <ListGroup>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.report.shipmentCost")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={shipmentcost} />
                  <p>{i18n.t("static.supplyPlanFormula.costOfInventoryNote")}</p>
                </ListGroupItemText>
              </ListGroupItem>
            </ListGroup>
          </ModalBody>
        </Modal>

         {/*Show term logic*/}
         <Modal isOpen={this.state.showtermslogic} className={'modal-xl ' + this.props.className} >
          <ModalHeader toggle={this.toggleShowTermLogic} className="ModalHead modal-info-Headher"><strong className="TextWhite">{i18n.t("static.common.formulae")}</strong></ModalHeader>
          <ModalBody >
            <ListGroup style={{ height: '300px', overflowY: 'scroll' }}>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlanFormula.amc")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img className="formula-img-mr img-fluid" src={amc} /><br></br>
                  <p>{i18n.t("static.supplyPlanFormula.amcNote")}</p>
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx1')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx2')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx3')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx4')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx5')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx6')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx7')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx8')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx9')}<br></br>

                    <br></br>
                    {i18n.t("static.supplyPlanFormula.amcEx10")}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx11')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx12')}<br></br>
                    {i18n.t('static.supplyPlanFormula.amcEx13')}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.monthsOfStock")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={mos} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.amcEx13")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.monthsOfStockEx4")}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <div className="mt-2" >
                <p>{i18n.t("static.supplyPlanFormula.costOfInventoryNote")}</p>
              </div>
            </ListGroup>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default SupplyPlanFormulas;

import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Modal, ModalBody, ModalFooter, ModalHeader, Row, Badge, Button, Collapse } from 'reactstrap';
import openingbalance from '../../assets/img/Opening-balance-formula.png';
import endingbalance from '../../assets/img/Ending balance-formula.png';
import exipredStock from '../../assets/img/ExpiredStock.png';
import amc from '../../assets/img/AMC-Formula.png';
import minstock from '../../assets/img/Min-Formula.png';
import maxstock from '../../assets/img/Max-Formula.png';
import maxQty from '../../assets/img/maxQty.png';
import minmonthstock from '../../assets/img/Min-Months-Of-Stock-formula.png';
import maxmonthstock from '../../assets/img/Max-Months-Of-Stock-formula.png';
import suggestorder from '../../assets/img/suggest order-Formula.png';
import suggestorderqty from '../../assets/img/suggest order qty-Formula.png';
import mos from '../../assets/img/Month0fstock-Formula.png';
import costOfinventory from '../../assets/img/Cost-Of-Inventory.png';
import Inventoryturns from '../../assets/img/Inventory Turns.png';
import forcasterror from '../../assets/img/ForecastError-Formula.png';
import shipmentcost from '../../assets/img/Shipment-cost-formula.png';
import adjustedConsumption from '../../assets/img/AdjustedConsumption.png';
import suggestedShipmentplan1 from '../../assets/img/suggestedShipmentplan1.png';
import suggestedShipmentplan2 from '../../assets/img/suggestedShipmentplan2.png';
import '../../assets/font_formulae/lmromanslant10-regular-webfont.woff';
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
      showtermslogic: false,
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
                <ListGroupItemHeading className="formulasheading">{i18n.t('static.dataentry.adjustedConsumption')}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img src={adjustedConsumption} className="formula-img-mr img-fluid" />

                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>

                    {i18n.t("static.supplyPlanFormula.forecastConsumption") + " = 10,000"}<br></br>
                    {i18n.t("static.dataentry.adjustedConsumption") + " = 10,000"}<br></br></p>
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.report.actualConsumption") + " = 10,000"}<br></br>
                    {i18n.t("static.consumption.daysofstockout") + " = 10"}<br></br>
                    {i18n.t("static.supplyPlanFormula.noOfDaysInMonth") + " = 30"}<br></br>
                    {i18n.t("static.dataentry.adjustedConsumption") + " = " + i18n.t("static.report.actualConsumption") + " * " + i18n.t("static.supplyPlanFormula.noOfDaysInMonth") + " / (" + i18n.t("static.supplyPlanFormula.noOfDaysInMonth") + " - " + i18n.t("static.consumption.daysofstockout") + ")"}<br></br>
                    {i18n.t("static.dataentry.adjustedConsumption") + " = 1000 * 30 / (30-10)"}<br></br>
                    {i18n.t("static.dataentry.adjustedConsumption") + " = 30000 / 20"}<br></br>
                    {i18n.t("static.dataentry.adjustedConsumption") + " = 1500"}<br></br>
                  </p>
                </ListGroupItemText>
              </ListGroupItem>
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
                    {i18n.t("static.dataentry.adjustedConsumption") + " =7,087"}<br></br>
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
                    {i18n.t("static.dataentry.adjustedConsumption") + " =7,087"}<br></br>
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
              {/* <ListGroupItem >
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
              </ListGroupItem> */}
              {/* <ListGroupItem > */}
              {/* <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.maxStock")}</ListGroupItemHeading> */}
              {/* <ListGroupItemText className="formulastext"> */}
              {/* Max = AMC * MIN(MAX(MIN_MONTHS_OF_STOCK,3)+REORDER_FREQUENCY,18) */}
              {/* <img className="formula-img-mr img-fluid" src={maxstock} />
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
                    {i18n.t("static.supplyPlanFormula.maxStockEx11")}</p> */}
              {/* </ListGroupItemText> */}
              {/* </ListGroupItem> */}
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
                    {i18n.t("static.supplyPlanFormula.minMonthOfStockEx6")}<br></br><br></br>
                    {i18n.t("static.supplyPlanFormula.minMaxNote")}
                  </p>
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
                    {i18n.t("static.supplyPlanFormula.maxMonthOfStockEx5")}<br></br><br></br>
                    {i18n.t("static.supplyPlanFormula.minMaxNote")}
                  </p>
                </ListGroupItemText>
              </ListGroupItem>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.maxQty")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={maxQty} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t('static.supplyPlan.maxQtyFormula1')}<br></br>
                    {i18n.t('static.supplyPlan.maxQtyFormula2')}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx3")}<br></br>
                    <br></br>
                    {i18n.t('static.supplyPlan.maxQtyFormula3')}<br></br>
                    {i18n.t('static.supplyPlan.maxQtyFormula4')}<br></br>
                    {i18n.t('static.supplyPlan.maxQtyFormula5')}<br></br>
                    {i18n.t('static.supplyPlan.maxQtyFormula6')}<br></br>
                  </p>
                </ListGroupItemText>
              </ListGroupItem>
              {/* <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlanFormula.whenToSuggest")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={suggestorder} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    <b>{i18n.t('static.supplyPlan.whenToSuggestQty1')}</b><br></br><br></br>
                    {i18n.t("static.supplyPlanFormula.suggestShipmentEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.suggestShipmentEx2")}<br></br>
                    {i18n.t("static.supplyPlanFormula.suggestShipmentEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.suggestShipmentEx4")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.suggestShipmentEx5")}<br></br><br></br>
                    {i18n.t("static.supplyPlanFormula.whenToSuggestEx3")}<br></br><br></br>

                    <b>{i18n.t("static.supplyPlan.whenToSuggestQty2")}</b><br></br><br></br>
                    {i18n.t("static.supplyPlan.whenToSuggestQty3")}<br></br>
                    {i18n.t("static.supplyPlan.whenToSuggestQty4")}<br></br>
                    {i18n.t("static.supplyPlan.whenToSuggestQty5")}<br></br>
                    {i18n.t("static.supplyPlan.whenToSuggestQty6")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlan.whenToSuggestQty7")}<br></br><br></br>
                    {i18n.t("static.supplyPlanFormula.whenToSuggestEx3")}

                  </p>
                </ListGroupItemText>
              </ListGroupItem> */}
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t('static.formula.suggestedText1')}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <p><i>{i18n.t('static.formula.suggestedText2')}<a href='/#/programProduct/addProgramProduct' target="_blank">{i18n.t('static.formula.suggestedText3')}</a>{i18n.t('static.formula.suggestedText4')}</i></p>

                  <div className='formulaBox borderedBoxforformulae'>
                    <i>
                      <p>{i18n.t('static.formula.suggestedText5')}</p>
                      <p>{i18n.t('static.formula.suggestedText6')}</p>
                      <p>{i18n.t('static.formula.suggestedText7')}</p>
                      <p>
                        <ol type='a' style={{ marginTop: '-14px' }}>
                          <li>
                            {i18n.t("static.formula.suggestedText8")} &lt; {i18n.t('static.formula.suggestedText9')+" "}<b>{i18n.t('static.formula.suggestedText10')}</b>{i18n.t('static.formula.suggestedText11')}
                          </li>
                          <li>
                            {i18n.t('static.formula.suggestedText12')} &gt; {i18n.t('static.formula.suggestedText13')+" "} <b>{i18n.t('static.formula.suggestedText14')}</b>.
                            {" "+i18n.t('static.formula.suggestedText15')}
                          </li>
                        </ol></p>
                      <p>{i18n.t('static.formula.suggestedText16')} &lt; {i18n.t('static.formula.suggestedText17')}</p>

                      <ol type='a' style={{ marginTop: '-14px' }}>
                        <li>
                          {i18n.t("static.formula.suggestedText18")+" "} <b>{i18n.t('static.formula.suggestedText19')}</b>.
                          {" "+i18n.t('static.formula.suggestedText20')}
                        </li>
                        <li>{i18n.t('static.formula.suggestedText21')}</li>
                      </ol>
                    </i>
                  </div>

                  <p ><span className='formulastext-p'>{i18n.t('static.formula.suggestedText22')}</span>
                    <ul type='disc'>
                      <li>
                        {i18n.t('static.formula.suggestedText23')}
                      </li>
                      <li>
                        {i18n.t('static.formula.suggestedText24')}
                      </li>
                      <li>{i18n.t('static.formula.suggestedText25')}
                        {i18n.t('static.formula.suggestedText26')}</li>
                      <li>
                        {i18n.t('static.formula.suggestedText27')}
                      </li>
                      <li>{i18n.t('static.formula.suggestedText28')}</li>

                    </ul>
                  </p>
                  <p><span className='formulastext-p'>{i18n.t('static.formula.suggestedText29')}</span>
                    <ul type='disc'>
                      <li>{i18n.t('static.formula.suggestedText30')}</li>
                      <li>{i18n.t('static.formula.suggestedText31')}</li>
                      <li>{i18n.t('static.formula.suggestedText32')}

                      </li>
                    </ul>
                    <ul className='pl-5'>
                      <li>{i18n.t('static.formula.suggestedText33')+" "} <b>{i18n.t('static.formula.suggestedText34')}</b>:
                        <br></br>
                        {i18n.t('static.formula.suggestedText35')}
                        <br></br>
                        = 15*3,000 - 30,000
                        <br></br>
                        = 15,000</li>
                    </ul>
                  </p>
                  <p><span className='formulastext-p'>{i18n.t('static.formula.suggestedText36')}</span>
                    <ul type='disc'>
                      <li>{i18n.t('static.formula.suggestedText37')}</li>
                      <li>{i18n.t('static.formula.suggestedText38')}</li>
                      <li>{i18n.t('static.formula.suggestedText39')}
                        {i18n.t('static.formula.suggestedText40')}
                      </li>
                      <li>
                        {i18n.t('static.formula.suggestedText41')}
                      </li>
                      <li>{i18n.t('static.formula.suggestedText42')}</li>
                    </ul>
                  </p>
                  <p><span className='formulastext-p'>{i18n.t('static.formula.suggestedText43')}</span>
                    <ul type="disc">
                      <li>{i18n.t('static.formula.suggestedText44')}</li>
                      <li>{i18n.t('static.formula.suggestedText45')}</li>

                    </ul>
                    <ul className='pl-5'>
                      <li>&nbsp;{i18n.t('static.formula.suggestedText46')} &gt; {i18n.t('static.formula.suggestedText47')}</li>
                      <li> &nbsp;{i18n.t('static.formula.suggestedText48')}<br/>
                        {i18n.t('static.formula.suggestedText49')}<br/>
                        = 12*3,000 - 0 + 0<br/>
                        = 36,000<br/>
                      </li>
                    </ul>
                  </p>

                </ListGroupItemText>
              </ListGroupItem>

              {/* <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlanFormula.suggestedOrderQty")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={suggestorderqty} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    <b>{i18n.t('static.supplyPlan.whenToSuggestQty1')}</b><br></br><br></br>
                    {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx1")}<br></br>
                    {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx2")}<br></br>
                    <br></br>
                    {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx3")}<br></br>
                    {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx4")}<br></br>
                    {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx5")}</p><br></br>
                  <b>{i18n.t("static.supplyPlan.whenToSuggestQty2")}</b><br></br><br></br>
                  {i18n.t("static.supplyPlan.suggestedMaxQty1")}<br></br>
                  {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx2")}<br></br>
                  {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx6")}<br></br><br></br>

                  {i18n.t("static.supplyPlan.suggestedMaxQty2")}<br></br>
                  {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx4")}<br></br>
                  {i18n.t("static.supplyPlanFormula.suggestedOrderQtyEx5")}<br></br>
                </ListGroupItemText>
              </ListGroupItem> */}

              <ListGroupItem>
                <ListGroupItemHeading className="formulasheading">{i18n.t('static.formula.suggestedText50')}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <p><i>{i18n.t('static.formula.suggestedText51')}<a href='/#/programProduct/addProgramProduct' target="_blank">{i18n.t('static.formula.suggestedText3')}</a>{i18n.t('static.formula.suggestedText4')}</i></p>

                  <div className='formulaBox borderedBoxforformulae'>
                    <p>{i18n.t('static.formula.suggestedText52')}</p>
                    <p>{i18n.t('static.formula.suggestedText53')}</p>
                    <p>{i18n.t('static.formula.suggestedText54')}</p>
                    <p>
                      <ol type='a' style={{ marginTop: '-14px' }}>
                        <li>{i18n.t('static.formula.suggestedText55')}&lt; {i18n.t('static.formula.suggestedText56')+" "} <b>{i18n.t('static.formula.suggestedText57')}</b>.
                          {i18n.t('static.formula.suggestedText58')}
                        </li>
                        <li>{i18n.t('static.formula.suggestedText59')} &gt; {i18n.t('static.formula.suggestedText60')+" "} <b>{i18n.t('static.formula.suggestedText61')}</b>.
                          {i18n.t('static.formula.suggestedText62')}
                        </li>
                      </ol></p>
                    <p>
                      {i18n.t('static.formula.suggestedText63')} &lt;{i18n.t('static.formula.suggestedText64')}
                    </p>
                    <p>
                      <ol type='a' style={{ marginTop: '-14px' }}>
                        <li>{i18n.t('static.formula.suggestedText65')+" "}<b>{i18n.t('static.formula.suggestedText66')}</b>.
                          {i18n.t('static.formula.suggestedText67')}</li>
                        <li>{i18n.t('static.formula.suggestedText68')}</li>
                      </ol></p>
                    <p>{i18n.t('static.formula.suggestedText69')}</p>
                  </div>

                  <p><span className='formulastext-p'>{i18n.t('static.formula.suggestedText70')}</span>
                    <p>{i18n.t('static.formula.suggestedText71')}</p>
                    <div><img src={suggestedShipmentplan1}></img></div>
                    {i18n.t("static.formula.suggestedText72")}
                    <br></br>
                    {i18n.t("static.formula.suggestedText73")}
                    <br></br>
                    {i18n.t('static.formula.suggestedText74')}
                    <br></br>
                    {i18n.t('static.formula.suggestedText75')}
                    <br></br>
                    {i18n.t('static.formula.suggestedText76')}

                  </p>

                  <p><span className='formulastext-p'>{i18n.t('static.formula.suggestedText77')}</span>
                    <ul type="disc">
                      <li>{i18n.t('static.formula.suggestedText78')}</li>
                      <li>{i18n.t('static.formula.suggestedText79')}</li>
                      <li>{i18n.t('static.formula.suggestedText80')}</li>

                    </ul>
                    <ul>
                      <li>{i18n.t('static.formula.suggestedText81')+" "}<b>{i18n.t('static.formula.suggestedText82')}</b>
                        <br></br>{i18n.t('static.formula.suggestedText83')}
                        <br></br>{i18n.t('static.formula.suggestedText84')}
                        <br></br>= 1,600 - 900
                        <br></br>{i18n.t('static.formula.suggestedText85')}
                      </li>
                    </ul>
                  </p>

                  <p><span className='formulastext-p'>{i18n.t('static.formula.suggestedText86')}</span>
                    <p>{i18n.t('static.formula.suggestedText87')}</p>
                    <div> <img src={suggestedShipmentplan2}></img></div>
                    <p>

                      {i18n.t('static.formula.suggestedText88')}
                      <br></br>
                      {i18n.t('static.formula.suggestedText89')}
                      <br></br>
                      {i18n.t('static.formula.suggestedText90')}
                      <br></br>
                      {i18n.t('static.formula.suggestedText91')}
                      <br></br>
                      {i18n.t('static.formula.suggestedText92')}
                    </p>

                    <p><span className='formulastext-p'>{i18n.t('static.formula.suggestedText93')}</span>
                      <ul type="disc">
                        <li >{i18n.t('static.formula.suggestedText94')}</li>
                        <li>{i18n.t('static.formula.suggestedText95')}</li>
                      </ul>
                      <ul className='pl-5'>
                        <li>
                          {i18n.t('static.formula.suggestedText96')} &gt; {i18n.t('static.formula.suggestedText97')} &gt; {i18n.t('static.formula.suggestedText98')}
                        </li>
                        <li>
                          {i18n.t('static.formula.suggestedText99')+" "} <b>{i18n.t('static.formula.suggestedText100')}</b>
                          <br></br>{i18n.t('static.formula.suggestedText101')}<br></br>
                          = 1,000 - 0 + 20 <br></br>{i18n.t('static.formula.suggestedText102')}
                        </li>


                      </ul>
                    </p>
                  </p>
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
                  <p>{"1) "+i18n.t("static.supplyPlanFormula.inventoryTurns1")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns1L1")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns1L2")}</p>

                  <p>{"2) "+i18n.t("static.supplyPlanFormula.inventoryTurns2")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns2L1")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns2L2")}</p>

                  <p>{"3) "+i18n.t("static.supplyPlanFormula.inventoryTurns3")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns3L1")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns3L2")}</p>

                  <p>{"4) "+i18n.t("static.supplyPlanFormula.inventoryTurns4")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns4L1")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns4L2")}</p>

                  <p>{"5) "+i18n.t("static.supplyPlanFormula.inventoryTurns5")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns5L1")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns5L2")}</p>

                  <p>{"6) "+i18n.t("static.supplyPlanFormula.inventoryTurns6")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns6L1")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns6L2")}</p>

                  <p>{"7) "+i18n.t("static.supplyPlanFormula.inventoryTurns7")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns7L1")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurns7L2")}</p>

                  <p>{"8) "+i18n.t("static.supplyPlanFormula.inventoryTurns8")}<br></br>
                  {i18n.t('static.supplyPlanFormula.inventoryTurns8L1')}<a href='/#/programProduct/addProgramProduct' target="_blank">{i18n.t('static.formula.suggestedText3')}</a>{i18n.t('static.formula.suggestedText4')}</p>
                </ListGroupItemText>
              </ListGroupItem>
              <div className="mt-2" >
                <p><i>{i18n.t("static.supplyPlanFormula.inventoryTurnsNote")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurnsNote1")}<br></br>
                  {i18n.t("static.supplyPlanFormula.inventoryTurnsNote2")}</i></p>
              </div>
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
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.maxQty")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">

                  <img className="formula-img-mr img-fluid" src={maxQty} />
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t('static.supplyPlan.maxQtyFormula1')}<br></br>
                    {i18n.t('static.supplyPlan.maxQtyFormula2')}<br></br>
                    {i18n.t("static.supplyPlanFormula.maxStockEx3")}<br></br>
                    <br></br>
                    {i18n.t('static.supplyPlan.maxQtyFormula3')}<br></br>
                    {i18n.t('static.supplyPlan.maxQtyFormula4')}<br></br>
                    {i18n.t('static.supplyPlan.maxQtyFormula5')}<br></br>
                    {i18n.t('static.supplyPlan.maxQtyFormula6')}<br></br>
                  </p>
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

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
import suggestedShipmentplan1 from'../../assets/img/suggestedShipmentplan1.png';
import suggestedShipmentplan2 from'../../assets/img/suggestedShipmentplan2.png';
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
              <ListGroupItemHeading className="formulasheading">Suggested Shipments - “Plan by MOS”</ListGroupItemHeading>
              <ListGroupItemText className="formulastext">
             
                  <p><i>Note: Below is the logic for planning units that are planned by months of stock (MOS). Update the “plan by” setting in “<a href='#/planningUnit/editPlanningUnit' target="_blank">update planning unit</a>” screen.</i></p>
                  <p>Where Month N is the month QAT is calculating for:</p>
                  <div className='formulaBox borderedBoxforformulae'>
                  
                    <p>1. If AMC = 0 or N/A for Month N, no suggested shipment </p>
                    <p>2. If Month N is stocked out (Ending Balance = 0), QAT will always suggest a shipment </p>
                    
                    <ol type='a'>
                      <li>
                      If both of next 2 months (N+1, N+2) are &lt; Min MOS, suggested shipment will bring month N to <b>Max MOS</b>.Suggested qty = (Max MOS for N) * (AMC for N) – (Ending Balance for N) + (Unmet Demand for N) 
                      </li> 
                      <li>
                      If 1 or both of the next 2 months (N+1 or N+2) is &gt; Min MOS, suggested shipment will bring month N to <b>Min MOS</b>.  
                      Suggested qty = (Min MOS for N) * (AMC for N) – (Ending Balance for N) + (Unmet Demand for N)
                      </li>
                    </ol>
                    <p>3. Is product is understocked (MOS &lt; Min MOS) for 3 straight months (Month N, N+1, N+2)?</p>
                   
                    <ol type='a'>
                      <li>
                      a. If yes, suggested shipment to bring Month N to <b> Max MOS</b>. 
Suggested qty = (Max MOS for N) * (AMC for N) – (Ending Balance for N)
                        </li>
                        <li>If no, no suggested shipment</li>
                    </ol>

                    </div>

                        <p ><span className='formulastext-p'>Example 1 (understocked) </span>
                          <ul type='disc'>
                            <li>
                            Min MOS = 12; Reorder Interval = 3; Max MOS = 15
                            </li>
                            <li>
                            Calculating for Month N = Jan 2022
                            </li>
                            <li>AMC for N (Jan 2022) = 3,000
                          Ending Balance for N (Jan 2022) = 30,000</li>
                              <li>
                              Unmet Demand for N = 0
                              </li>
                            <li>MOS for N (Jan 2022) = 10; MOS for N+1 (Feb 2022) = 9.4; MOS for N+2 (March 2022) = 8.4</li>
                            
                          </ul>
                        </p>
                        <p><span className='formulastext-p'>Suggest a shipment? </span>
                        <ul type='disc'>
                            <li>Step 1: Jan 2022 AMC is not 0 or N/A</li>
                            <li>Step 2: Jan 2022 Ending Balance is not 0 (not stocked out)</li>
                            <li>Step 3: Product is understocked for 3 straight months – Jan 2022, Feb 2022, March 2022 all have MOS (10, 9.4, and 8.4) is less than Min MOS (12). 
                                
                            </li>
                          </ul>
                          <ul className='pl-5'>
                            <li>Therefore, QAT will suggest an order to bring Month N to the <b>Max MOS</b>: 
                            <br></br>
                            = (Max MOS for N) * (AMC for N) – (Ending Balance for N)
                            <br></br>
                            = 15*3,000 - 30,000 
                            <br></br>
                            = 15,000</li>
                          </ul>
                        </p>
                        <p><span className='formulastext-p'>Example 2 (stocked out):</span>
                        <ul type='disc'>
                        <li>Min MOS = 12; Reorder Interval = 3; Max MOS = 15</li>
                        <li>Calculating for Month N = Jan 2022</li>
                        <li>AMC for N (Jan 2022) = 3,000
                          Ending Balance for N (Jan 2022) = 0
                        </li>
                        <li>
                        Unmet Demand for N = 0
                        </li>
                        <li>MOS for N (Jan 2022) = 0; MOS for N+1 (Feb 2022) = 0; MOS for N+2 (March 2022) = 13</li>
                        </ul>
                        </p>
                        <p><span className='formulastext-p'>Suggest a shipment? :</span>
                        <ul type="disc">
                          <li>Step 1: Jan 2022 AMC is not 0 or N/A</li>
                          <li>Step 2: Jan 2022 Ending Balance is 0</li>
                          
                        </ul>
                        <ul className='pl-5'>
                        <li>&nbsp;1 of next 2 months is &gt; Min MOS (Jan 2022, Feb 2022 are stocked out and March 2022 is stocked-to-plan).</li>
                          <li> &nbsp;Therefore, QAT will suggest a shipment to bring Month N to Min MOS.  
                          = (Min MOS for N) * (AMC for N) – (Ending Balance for N) + (Unmet Demand for N)
                          = 12*3,000 - 0 + 0
                          = 36,000
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
              <ListGroupItemHeading className="formulasheading">Suggested Shipments - “Plan by Quantity”</ListGroupItemHeading>
              <ListGroupItemText className="formulastext">
              <p><i>Note: Below is the logic for planning units that are planned by quantity. Update the “plan by” setting in “<a href='#/planningUnit/editPlanningUnit' target="_blank">update planning unit</a>” screen.</i></p>
                  <p>Where Month N is the month QAT is calculating for, and X = Distribution Lead Time:</p>
            <div className='formulaBox borderedBoxforformulae'>
              <p>1. If AMC = 0 or N/A for Month N, no suggested shipment </p>
              <p>2. If Month N is stocked out (Ending Balance = 0), QAT will always suggest a shipment</p>
              <ul type='a'>
                <li>a. If both of next 2 months (N+1, N+2) are &lt; Min Qty, suggested shipment is the quantity that would bring Month N to <b>Max Qty</b>.
                    Suggested Qty = (Max Qty for N) – (Ending Balance for N) + (Unmet Demand for N)
                </li>
                <li>b. If one or both of the next 2 months (N+1 or N+2) is &gt; Min Qty, suggested shipment is the quantity that would bring Month N to <b>Min Qty</b>.  
                    Suggested Qty = (Min Qty) – (Ending Balance for N) + (Unmet Demand for N)
                </li>
              </ul>
              <p>
                3. Is product understocked (Ending Balance &lt; Min Qty) for 3 straight months (Month N, N+1, N+2)?
              </p>
              <ul type='a'>
                <li>    a. If yes, suggested shipment is the quantity that would bring Month N to <b>Max Qty</b>. 
Suggested Qty = (Max Qty for N) – (Ending Balance for N)</li>
                <li>If no, no suggested shipment</li>
              </ul>
              
             </div>
             <p>QAT puts the suggested quantity in Month N-X. In other words, X months before Month N, where X is the Distribution Lead Time.</p>
             <p><span className='formulastext-p'>Example 1 (understocked):</span>
             <p>Min Qty = 1,000; Reorder Interval = 6 months; Distribution lead time (X) = 1 month</p>
              <div><img src={suggestedShipmentplan1}></img></div>
              Calculating for Month N =Nov 2022
              <br></br>
              AMC for N (Nov 2022) = 100
              <br></br>
              Max Qty for N (Nov 2022) = 1,600
              <br></br>
              Unmet Demand for N (Nov 2022) = 0
              <br></br>
              Ending Balance for N (Nov 2022) = 900; for N + 1 (Dec 2022) = 800; for N + 2 (Jan 2023) = 700
             
             </p>

             <p><span className='formulastext-p'>Suggest a shipment? :</span>
             <ul type="disc">
              <li>Step 1: Nov 2022 AMC is not 0 or N/A</li>
              <li>Step 2: Nov 2022 Ending Balance is not 0</li>
              <li>Step 3: Product is understocked for 3 straight months – Nov 2022, Dec 2022, Jan 2023 all have Ending Balance (900, 800, 700) is less than Min Qty (1,000).</li>

             </ul>
             <ul>
              <li>Therefore, QAT will suggest a shipment in Month N-X (Nov 2022 – 1 = Oct 2022) to bring Month N (Nov 2022) to <b> Max Qty </b>  
              <br></br>= (Max Qty for N) – (Ending Balance for N)
              <br></br>= (Max Qty for Nov 22) – (Ending Balance for Nov 22)
              <br></br>= 1,600 - 900 
              <br></br>= 700 suggested in Oct 2022
              </li>
             </ul>
             </p>

             <p><span className='formulastext-p'>Example 2 (stocked out, but future months above Min Qty):</span>
             <p>Min Qty = 1,000; Reorder Interval = 6 months; Distribution Lead Time (X) = 1 month</p>
            <div> <img src={suggestedShipmentplan2}></img></div>
            <p>
                            
              Calculating for Month N =Aug 2023
              <br></br>
              AMC for N (Aug 2023) = 103
              <br></br>
              Max Qty for N (Nov 2022) = 1,600
              <br></br>
              Unmet Demand for N (Nov 2022) = 20
              <br></br>
              Ending Balance for N (Aug 2023) = 0; for N + 1 (Sep 2023) = 1,200; for N + 2 (Oct 2023) = 1,100
              </p>
                          
              <p><span className='formulastext-p'>Suggest a shipment? :</span>
              <ul type="disc">
                <li >Step 1: Aug 2023 AMC is not 0 or N/A</li>
                <li>Step 2a: Aug 2023 Ending Balance is 0</li>
              </ul>
              <ul className='pl-5'>
                <li>
                (N+1 and N+2) &gt; Min Qty. Both of the next two months (Sept 2023 and Oct 2023) have Ending Balance (1,200) and (1,100) are &gt; Min Qty (1,000)
                </li>
                <li>
                Therefore, QAT will suggest a shipment in Month N-X (Aug 2023 – 1 = Jul 2023) to bring Month N (Aug 2023) to <b>Min Qty</b>
                <br></br>= (Min Qty) – (Ending Balance for N) + (Unmet Demand for N)<br></br>
                = 1,000 - 0 + 20 <br></br>= 1,020 in Jul 2023 
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

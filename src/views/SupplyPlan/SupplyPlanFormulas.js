import React, { Component } from 'react';
import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Modal, ModalBody, ModalHeader } from 'reactstrap';
import '../../assets/font_formulae/lmromanslant10-regular-webfont.woff';
import amc from '../../assets/img/AMC-Formula.png';
import adjustedConsumption from '../../assets/img/AdjustedConsumption.png';
import costOfinventory from '../../assets/img/Cost-Of-Inventory.png';
import exipredStock from '../../assets/img/ExpiredStock.png';
import forcasterror from '../../assets/img/ForecastError-Formula.png';
import maxmonthstock from '../../assets/img/Max-Months-Of-Stock-formula.png';
import minmonthstock from '../../assets/img/Min-Months-Of-Stock-formula.png';
import mos from '../../assets/img/Month0fstock-Formula.png';
import openingbalance from '../../assets/img/Opening-balance-formula.png';
import forcasterrorWAPE from '../../assets/img/WAPE-ForecastError-Formula.png';
import shipmentcost from '../../assets/img/Shipment-cost-formula.png';
import maxQty from '../../assets/img/maxQty.png';
import suggestedShipmentplan1 from '../../assets/img/suggestedShipmentplan1.png';
import suggestedShipmentplan2 from '../../assets/img/suggestedShipmentplan2.png';
import i18n from '../../i18n';
/**
 * This component is used to display formulas for multiple screens
 */
class SupplyPlanFormulas extends Component {
  constructor(props) {
    super(props);
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
    this.togglecostOfInventory = this.togglecostOfInventory.bind(this);
    this.toggleForecastMatrix = this.toggleForecastMatrix.bind(this);
    this.toggleForecastMatrix1 = this.toggleForecastMatrix1.bind(this);
    this.toggleStockStatusOverTime = this.toggleStockStatusOverTime.bind(this);
    this.toggleInventoryTurns = this.toggleInventoryTurns.bind(this);
    this.toggleStockStatus = this.toggleStockStatus.bind(this);
    this.toggleStockStatusAcrossPlaningUnit = this.toggleStockStatusAcrossPlaningUnit.bind(this);
    this.toggleShippmentCost = this.toggleShippmentCost.bind(this);
    this.toggleStockStatusMatrix = this.toggleStockStatusMatrix.bind(this);
  }
  /**
   * This function is used to toggle the show formula modal for supply planning screens
   */
  toggle() {
    this.setState({
      modal: !this.state.modal,
    });
  }
  /**
   * This function is used to toggle the show formula modal for cost of inventory report screen
   */
  togglecostOfInventory() {
    this.setState({
      costofinventory: !this.state.costofinventory,
    });
  }
  /**
   * This function is used to toggle the show formula modal for forecast matrix over time report screen
   */
  toggleForecastMatrix() {
    this.setState({
      forecastmatrix: !this.state.forecastmatrix,
    });
  }
  /**
   * This function is used to toggle the show formula modal for forecast matrix report screen
   */
  toggleForecastMatrix1() {
    this.setState({
      forecastmatrix1: !this.state.forecastmatrix1,
    });
  }
  /**
   * This function is used to toggle the show formula modal for stock status over time report screen
   */
  toggleStockStatusOverTime() {
    this.setState({
      stockstatusovertime: !this.state.stockstatusovertime,
    });
  }
  /**
   * This function is used to toggle the show formula modal for inventory turns report screen
   */
  toggleInventoryTurns() {
    this.setState({
      inventoryturns: !this.state.inventoryturns,
    });
  }
  /**
   * This function is used to toggle the show formula modal for stock status report screen
   */
  toggleStockStatus() {
    this.setState({
      stockstatus: !this.state.stockstatus,
    });
  }
  /**
   * This function is used to toggle the show formula modal for stock status across planning unit report screen
   */
  toggleStockStatusAcrossPlaningUnit() {
    this.setState({
      stockstatusacrossplaningunit: !this.state.stockstatusacrossplaningunit,
    });
  }
  /**
   * This function is used to toggle the show formula modal for shipment report screen
   */
  toggleShippmentCost() {
    this.setState({
      shipmentcost: !this.state.shipmentcost,
    });
  }
  /**
   * This function is used to toggle the show formula modal for stock status matrix report screen
   */
  toggleStockStatusMatrix() {
    this.setState({
      stockstatusmatrix: !this.state.stockstatusmatrix,
    });
  }
  /**
   * This is used to display the content
   * @returns It returns the modal popup for different screens to show formulas
   */
  render() {
    return (
      <div className="animated fadeIn">
        <Modal isOpen={this.state.modal} className={'modal-xl ' + this.props.className} >
          <ModalHeader toggle={this.toggle} className="ModalHead modal-info-Headher"><strong className="TextWhite" >{i18n.t('static.common.formulae')}</strong></ModalHeader>
          <ModalBody >
            <ListGroup style={{ height: "calc(100vh - 110px)", overflowY: 'scroll' }}>
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
                    {i18n.t("static.dataentry.adjustedConsumption") + " = 10,000 * 30 / (30-10)"}<br></br>
                    {i18n.t("static.dataentry.adjustedConsumption") + " = 15,000"}<br></br>
                  </p>
                </ListGroupItemText>
              </ListGroupItem>
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
                            {i18n.t("static.formula.suggestedText8")} &lt; {i18n.t('static.formula.suggestedText9') + " "}<b>{i18n.t('static.formula.suggestedText10')}</b>{i18n.t('static.formula.suggestedText11')}
                          </li>
                          <li>
                            {i18n.t('static.formula.suggestedText12')} &gt; {i18n.t('static.formula.suggestedText13') + " "} <b>{i18n.t('static.formula.suggestedText14')}</b>.
                            {" " + i18n.t('static.formula.suggestedText15')}
                          </li>
                        </ol></p>
                      <p>{i18n.t('static.formula.suggestedText16')} &lt; {i18n.t('static.formula.suggestedText17')}</p>
                      <ol type='a' style={{ marginTop: '-14px' }}>
                        <li>
                          {i18n.t("static.formula.suggestedText18") + " "} <b>{i18n.t('static.formula.suggestedText19')}</b>.
                          {" " + i18n.t('static.formula.suggestedText20')}
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
                      <li>{i18n.t('static.formula.suggestedText33') + " "} <b>{i18n.t('static.formula.suggestedText34')}</b>:
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
                      <li> &nbsp;{i18n.t('static.formula.suggestedText48')}<br />
                        {i18n.t('static.formula.suggestedText49')}<br />
                        = 12*3,000 - 0 + 0<br />
                        = 36,000<br />
                      </li>
                    </ul>
                  </p>
                </ListGroupItemText>
              </ListGroupItem>
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
                        <li>{i18n.t('static.formula.suggestedText55')}&lt; {i18n.t('static.formula.suggestedText56') + " "} <b>{i18n.t('static.formula.suggestedText57')}</b>.
                          {i18n.t('static.formula.suggestedText58')}
                        </li>
                        <li>{i18n.t('static.formula.suggestedText59')} &gt; {i18n.t('static.formula.suggestedText60') + " "} <b>{i18n.t('static.formula.suggestedText61')}</b>.
                          {i18n.t('static.formula.suggestedText62')}
                        </li>
                      </ol></p>
                    <p>
                      {i18n.t('static.formula.suggestedText63')} &lt;{i18n.t('static.formula.suggestedText64')}
                    </p>
                    <p>
                      <ol type='a' style={{ marginTop: '-14px' }}>
                        <li>{i18n.t('static.formula.suggestedText65') + " "}<b>{i18n.t('static.formula.suggestedText66')}</b>.
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
                      <li>{i18n.t('static.formula.suggestedText81') + " "}<b>{i18n.t('static.formula.suggestedText82')}</b>
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
                          {i18n.t('static.formula.suggestedText99') + " "} <b>{i18n.t('static.formula.suggestedText100')}</b>
                          <br></br>{i18n.t('static.formula.suggestedText101')}<br></br>
                          = 1,000 - 0 + 20 <br></br>{i18n.t('static.formula.suggestedText102')}
                        </li>
                      </ul>
                    </p>
                  </p>
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
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.supplyPlan.endingBalance") + " / " + i18n.t("static.supplyPlan.unmetDemandStr")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <div className='formulaBox borderedBoxforformulae'>
                    <i>
                      <p><b>{i18n.t("static.supplyPlan.projectedInventory")}</b> {i18n.t("static.showFormula.endingBalance1")}</p>
                      <p>{i18n.t("static.showFormula.endingBalance2")}</p>
                      <p><b>{i18n.t("static.supplyPlanFormula.endingBalanceFormula")}</b> {i18n.t("static.showFormula.endingBalance3")}</p>
                      <p><b>{i18n.t("static.showFormula.endingBalance4")}</b> {i18n.t("static.showFormula.endingBalance5")}</p>
                      <p><b>{i18n.t("static.supplyPlan.unmetDemandStr")}</b> {i18n.t("static.showFormula.endingBalance6")}</p>
                    </i>
                  </div>
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.openingBalanceFormula") + " = 5,698,925"}<br></br>
                    {i18n.t("static.supplyPlan.adjustments") + " = 0"}<br></br>
                    {i18n.t("static.dashboard.shipments") + " = 0"}<br></br>
                    {i18n.t("static.supplyPlan.consumption") + " = 310,000"}<br></br>
                    {i18n.t("static.showFormula.endingBalance7") + " = 10"}<br></br>
                    {i18n.t("static.showFormula.endingBalance8") + " = 31"}<br></br>
                    {i18n.t("static.showFormula.endingBalance9") + " = (310,000 * 31) / (31 - 10)"}<br></br>
                    {i18n.t("static.supplyPlanFormula.expiredStock") + " = 0"}<br></br>
                    <br></br>
                    <b>{i18n.t("static.supplyPlan.projectedInventory")}</b><br></br>
                    {i18n.t("static.showFormula.endingBalance1")}<br />
                    {" = 5,698,925 + 0 + 0 - 310,000 - 0"}<br></br>
                    {" = 5,388,925"}<br></br><br></br>
                    <b>{i18n.t("static.supplyPlan.endingBalance")}</b><br></br>
                    {i18n.t("static.showFormula.endingBalance3")}<br></br>
                    {"= " + i18n.t("static.supplyPlan.max") + " (5,388,925 , 0)"}<br></br>
                    {"= 5,388,925"}<br></br>
                    <br></br>
                    <b>{i18n.t("static.showFormula.endingBalance4")}</b><br></br>
                    {i18n.t("static.showFormula.endingBalance5")}<br></br>
                    {"= (310,000 * 10) / (31 - 10) "}<br></br>
                    {"= 147,619 "}<br></br>
                    <br></br>
                    <b>{i18n.t("static.supplyPlan.unmetDemandStr")}</b><br></br>
                    {i18n.t("static.showFormula.endingBalance6")}<br></br>
                    {"= 0 + 147,619"}<br></br>
                    {"= 147,619"}
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
            </ListGroup>
          </ModalBody>
        </Modal>
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
        <Modal isOpen={this.state.inventoryturns} className={'modal-lg ' + this.props.className} >
          <ModalHeader toggle={this.toggleInventoryTurns} className="ModalHead modal-info-Headher"><strong>{i18n.t("static.common.formulae")}</strong></ModalHeader>
          <ModalBody >
            <ListGroup>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.dashboard.inventoryTurns")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <p><b>{i18n.t("static.supplyPlanFormula.inventoryTurns1")}</b><br></br>
                    <p className="ml-3">
                      <b>{i18n.t("static.supplyPlanFormula.inventoryTurns2L1")}</b>
                      {i18n.t("static.supplyPlanFormula.inventoryTurns1L1")}<br></br>
                      {i18n.t("static.supplyPlanFormula.inventoryTurns1L4")}<br></br>
                      {i18n.t("static.supplyPlanFormula.inventoryTurns1L5")}<br></br>
                      {i18n.t("static.supplyPlanFormula.inventoryTurns1L6")}<br></br>
                      <ol>
                        <li>
                          {i18n.t("static.supplyPlanFormula.inventoryTurns1L7")}<br></br>
                          <ol type="a">
                            <li>{i18n.t("static.supplyPlanFormula.inventoryTurns1L8")}</li>
                            <li>{i18n.t("static.supplyPlanFormula.inventoryTurns1L9")}</li>
                          </ol>
                        </li>
                      </ol>
                      <div class="table-responsive" style={{ marginTop: '10px' }}>
                        <table className="table" border="1" textAlign="center">
                          <tr>
                            <td textAalign="center">{i18n.t("static.supplyPlanFormula.inventoryTurns1L10")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L11")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L12")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L13")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L14")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L15")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L16")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L17")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L18")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L19")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L20")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L21")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L22")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L23")}</td>
                            <td>{i18n.t("static.supplyPlanFormula.inventoryTurns1L24")}</td>
                          </tr>
                          <tr>
                            <td>12</td>
                            <td>12</td>
                            <td>11</td>
                            <td>10</td>
                            <td>9</td>
                            <td>8</td>
                            <td>7</td>
                            <td>6</td>
                            <td>5</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>78</td>
                            <td>6.5</td>
                          </tr>
                          <tr>
                            <td>11</td>
                            <td>1</td>
                            <td>11</td>
                            <td>10</td>
                            <td>9</td>
                            <td>8</td>
                            <td>7</td>
                            <td>6</td>
                            <td>5</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>67</td>
                            <td>5.6</td>
                          </tr>
                          <tr>
                            <td>10</td>
                            <td>2</td>
                            <td>1</td>
                            <td>10</td>
                            <td>9</td>
                            <td>8</td>
                            <td>7</td>
                            <td>6</td>
                            <td>5</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>58</td>
                            <td>4.8</td>
                          </tr>
                          <tr style={{fontWeight:'bold'}}>
                            <td>9</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>9</td>
                            <td>8</td>
                            <td>7</td>
                            <td>6</td>
                            <td>5</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>51</td>
                            <td>4.3</td>
                          </tr>
                          <tr>
                            <td>8</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>8</td>
                            <td>7</td>
                            <td>6</td>
                            <td>5</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>46</td>
                            <td>3.8</td>
                          </tr>
                          <tr>
                            <td>7</td>
                            <td>5</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>7</td>
                            <td>6</td>
                            <td>5</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>43</td>
                            <td>3.6</td>
                          </tr>
                          <tr>
                            <td>6</td>
                            <td>6</td>
                            <td>5</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>6</td>
                            <td>5</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>42</td>
                            <td>3.5</td>
                          </tr>
                          <tr>
                            <td>5</td>
                            <td>2</td>
                            <td>1</td>
                            <td>5</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>5</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>33</td>
                            <td>2.8</td>
                          </tr>
                          <tr>
                            <td>4</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>4</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>30</td>
                            <td>2.5</td>
                          </tr>
                          <tr>
                            <td>3</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>3</td>
                            <td>2</td>
                            <td>1</td>
                            <td>24</td>
                            <td>2.0</td>
                          </tr>
                          <tr>
                            <td>2</td>
                            <td>2</td>
                            <td>1</td>
                            <td>2</td>
                            <td>1</td>
                            <td>2</td>
                            <td>1</td>
                            <td>2</td>
                            <td>1</td>
                            <td>2</td>
                            <td>1</td>
                            <td>2</td>
                            <td>1</td>
                            <td>18</td>
                            <td>1.5</td>
                          </tr>
                          <tr>
                            <td>1</td>
                            <td>1</td>
                            <td>1</td>
                            <td>1</td>
                            <td>1</td>
                            <td>1</td>
                            <td>1</td>
                            <td>1</td>
                            <td>1</td>
                            <td>1</td>
                            <td>1</td>
                            <td>1</td>
                            <td>1</td>
                            <td>12</td>
                            <td>1.0</td>
                          </tr>
                        </table>
                      </div>
                      <br></br><br></br>
                      <b>{i18n.t("static.supplyPlanFormula.inventoryTurns2L3")}</b>{i18n.t("static.supplyPlanFormula.inventoryTurns1L2")}<br></br><br></br>
                      <b>{i18n.t("static.supplyPlanFormula.inventoryTurns2L9")}</b>{i18n.t("static.supplyPlanFormula.inventoryTurns1L3")}
                    </p>
                  </p>
                  <p><b>{i18n.t("static.supplyPlanFormula.inventoryTurns2")}</b><br></br>
                    <p className="ml-3">
                      <b>{i18n.t("static.supplyPlanFormula.inventoryTurns2L1")}</b><br></br>
                      <ol>
                        <li>{i18n.t("static.supplyPlanFormula.inventoryTurns2L2")}</li>
                      </ol>
                      <br></br>
                      <b>{i18n.t("static.supplyPlanFormula.inventoryTurns2L3")}</b><br></br>
                      <ol>
                        <li>{i18n.t("static.supplyPlanFormula.inventoryTurns2L4")}</li>
                        <li>{i18n.t("static.supplyPlanFormula.inventoryTurns2L5")}</li>
                        <li>{i18n.t("static.supplyPlanFormula.inventoryTurns2L6")}</li>
                        <li>{i18n.t("static.supplyPlanFormula.inventoryTurns2L7")}</li>
                        <li>{i18n.t("static.supplyPlanFormula.inventoryTurns2L8")}</li>
                      </ol>
                      <br></br>
                      <b>{i18n.t("static.supplyPlanFormula.inventoryTurns2L9")}</b><br></br>
                      <ol>
                        <li>{i18n.t("static.supplyPlanFormula.inventoryTurns2L10")}</li>
                        <li>{i18n.t("static.supplyPlanFormula.inventoryTurns2L11")}</li>
                        <li>{i18n.t("static.supplyPlanFormula.inventoryTurns2L12")}</li>
                        <li>{i18n.t("static.supplyPlanFormula.inventoryTurns2L13")}</li>
                        <li>{i18n.t("static.supplyPlanFormula.inventoryTurns2L14")}</li>
                      </ol>
                    </p>
                  </p>
                  <p><b>{i18n.t("static.supplyPlanFormula.inventoryTurns3")}</b><br></br>
                    <ol>
                      <li>{i18n.t("static.supplyPlanFormula.inventoryTurns3L1")}</li>
                      <li>{i18n.t("static.supplyPlanFormula.inventoryTurns3L2")}</li>
                    </ol>
                  </p>
                  <p><b>{i18n.t("static.supplyPlanFormula.inventoryTurns4")}</b><br></br>
                    <ol>
                      <li>{i18n.t("static.supplyPlanFormula.inventoryTurns4L1")}</li>
                      <li>{i18n.t("static.supplyPlanFormula.inventoryTurns4L2")}</li>
                    </ol>
                  </p>
                  <p><b>{i18n.t("static.supplyPlanFormula.inventoryTurns5")}</b><br></br>
                    <ol>
                      <li>{i18n.t('static.supplyPlanFormula.inventoryTurns5L1')}<a href='/#/programProduct/addProgramProduct' target="_blank">{i18n.t('static.formula.suggestedText3')}</a>{i18n.t('static.formula.suggestedText4')}</li>
                    </ol>
                  </p>
                </ListGroupItemText>
              </ListGroupItem>
            </ListGroup>
          </ModalBody>
        </Modal>
        <Modal isOpen={this.state.forecastmatrix} className={'modal-xl ' + this.props.className} >
          <ModalHeader toggle={this.toggleForecastMatrix} className="ModalHead modal-info-Headher"><strong className="TextWhite">{i18n.t("static.common.formulae")}</strong></ModalHeader>
          <ModalBody >
            <ListGroup>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.report.wapeFormula")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <p>{"1) " + i18n.t('static.report.forecastErrorMonthlyFormulaNew1')}</p>
                  <img className="formula-img-mr img-fluid" style={{width:'250px'}} src={forcasterrorWAPE} /><br></br>
                  <p>{i18n.t('static.report.forecastErrorMonthlyFormulaNew2')}</p>
                  <p>{"2) " + i18n.t('static.report.forecastErrorMonthlyFormulaNew3')} <b>{i18n.t('static.report.timeWindow')}</b> {i18n.t('static.report.forecastErrorMonthlyFormulaNew3a')}</p>
                  <img className="formula-img-mr img-fluid" src={forcasterror} /><br></br>
                  <p>{"3) " + i18n.t('static.report.forecastErrorMonthlyFormulaNew4a')} <b>{i18n.t('static.report.forecastErrorMonthlyFormulaNew4b')}</b> {i18n.t('static.report.forecastErrorMonthlyFormulaNew4c')}</p>
                  <p>{"4) " + i18n.t('static.report.forecastErrorMonthlyFormulaupdate4')} <i class="fa fa-exclamation-triangle" style={{color:'red'}} aria-hidden="true"></i> {i18n.t('static.report.forecastErrorMonthlyFormulaupdate41')} <b>{i18n.t('static.report.forecastErrorMonthlyFormulaupdate42')}</b></p>
                  <p>{"5) " + i18n.t('static.report.forecastErrorMonthlyFormulaupdate5')} <span style={{color:'red'}}>{i18n.t('static.report.forecastErrorMonthlyFormulaupdateredtext')}</span> {i18n.t('static.report.forecastErrorMonthlyFormulaupdateindicates')} <b>{i18n.t('static.report.forecastErrorMonthlyFormulaupdatecalculated')}</b> {i18n.t('static.report.forecastErrorMonthlyFormulaupdatethreshold')}</p>
                  <p>{"6) " + i18n.t('static.report.forecastErrorMonthlyFormulaNew6')}</p>
                  <p><b>{""+i18n.t('static.dataEntryAndAdjustments.StockOutRate')}</b> = {i18n.t('static.report.forecastErrorMonthlyFormulaNew6a')}</p>
                  <p><b>{""+i18n.t('static.dataentry.adjustedConsumption')}</b> = {i18n.t('static.report.forecastErrorMonthlyFormulaNew6b')}</p>
                  <p>{"7) " + i18n.t('static.report.forecastErrorMonthlyFormulaNew7')} <b>{i18n.t('static.report.forecastErrorMonthlyFormulaNew7a')}</b> {i18n.t('static.report.forecastErrorMonthlyFormulaNew7b')}
                  <ol>
                      <li>{i18n.t("static.report.forecastErrorMonthlyFormulaNew8")}</li>
                      <li>{i18n.t("static.report.forecastErrorMonthlyFormulaNew9")}</li>
                      <li>{i18n.t("static.report.forecastErrorMonthlyFormulaNew10")}</li>
                  </ol>
                  </p>
                  <p>{"8) " + i18n.t('static.report.forecastErrorMonthlyFormulaNew11a')} <b>{i18n.t('static.report.forecastErrorMonthlyFormulaNew11b')}</b>
                  <ol>
                      <li>{i18n.t("static.report.forecastErrorMonthlyFormulaNew12")}</li>
                      <li>{i18n.t("static.report.forecastErrorMonthlyFormulaNew13")}</li>
                      <li>{i18n.t("static.report.forecastErrorMonthlyFormulaNew14")}</li>
                      <li>{i18n.t("static.report.forecastErrorMonthlyFormulaNew10")}</li>
                  </ol>
                  </p>
                  </ListGroupItemText>
              </ListGroupItem>
            </ListGroup>
          </ModalBody>
        </Modal>
        <Modal isOpen={this.state.forecastmatrix1} className={'modal-xl ' + this.props.className} >
          <ModalHeader toggle={this.toggleForecastMatrix1} className="ModalHead modal-info-Headher"><strong className="TextWhite">{i18n.t("static.common.formulae")}</strong></ModalHeader>
          <ModalBody >
            <ListGroup>
              <ListGroupItem >
                <ListGroupItemHeading className="formulasheading">{i18n.t("static.report.wapeFormula")}</ListGroupItemHeading>
                <ListGroupItemText className="formulastext">
                  <img className="formula-img-mr img-fluid" src={forcasterror} /><br></br>
                  <p>{"1) " + i18n.t('static.report.forecastErrorMonthlyFormula1')}</p>
                  <p>{"2) " + i18n.t('static.report.forecastErrorMonthlyFormula8')}</p>
                  <p>{"3) " + i18n.t('static.report.forecastErrorMonthlyFormula6nomonth')}</p>
                  <p>{"4) " + i18n.t('static.report.forecastErrorMonthlyFormula7consumption')}</p>
                  <p>{"5) " + i18n.t('static.report.forecastErrorMonthlyFormula4row')} <span style={{color:'red'}}>{i18n.t('static.report.forecastErrorMonthlyFormula4redtext')}</span> {i18n.t('static.report.forecastErrorMonthlyFormula4indicatesthat')} <b>{i18n.t('static.report.forecastErrorMonthlyFormula4thresholdper')}</b> {i18n.t('static.report.forecastErrorMonthlyFormula4UpdatePlanningFe')}</p>
                  {/* <p>{i18n.t("static.report.wapeFormulaNote")}</p> */}
                </ListGroupItemText>
              </ListGroupItem>
            </ListGroup>
          </ModalBody>
        </Modal>
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
                  <div className='formulaBox borderedBoxforformulae'>
                    <i>
                      <p><b>{i18n.t("static.supplyPlan.projectedInventory")}</b> {i18n.t("static.showFormula.endingBalance1")}</p>
                      <p>{i18n.t("static.showFormula.endingBalance2")}</p>
                      <p><b>{i18n.t("static.supplyPlanFormula.endingBalanceFormula")}</b> {i18n.t("static.showFormula.endingBalance3")}</p>
                      <p><b>{i18n.t("static.showFormula.endingBalance4")}</b> {i18n.t("static.showFormula.endingBalance5")}</p>
                      <p><b>{i18n.t("static.supplyPlan.unmetDemandStr")}</b> {i18n.t("static.showFormula.endingBalance6")}</p>
                    </i>
                  </div>
                  <p><span className="formulastext-p">{i18n.t("static.common.example") + " :"}</span><br></br>
                    {i18n.t("static.supplyPlanFormula.openingBalanceFormula") + " = 5,698,925"}<br></br>
                    {i18n.t("static.supplyPlan.adjustments") + " = 0"}<br></br>
                    {i18n.t("static.dashboard.shipments") + " = 0"}<br></br>
                    {i18n.t("static.supplyPlan.consumption") + " = 310,000"}<br></br>
                    {i18n.t("static.showFormula.endingBalance7") + " = 10"}<br></br>
                    {i18n.t("static.showFormula.endingBalance8") + " = 31"}<br></br>
                    {i18n.t("static.showFormula.endingBalance9") + " = (310,000 * 31) / (31 - 10)"}<br></br>
                    {i18n.t("static.supplyPlanFormula.expiredStock") + " = 0"}<br></br>
                    <br></br>
                    <b>{i18n.t("static.supplyPlan.projectedInventory")}</b><br></br>
                    {i18n.t("static.showFormula.endingBalance1")}<br />
                    {" = 5,698,925 + 0 + 0 - 310,000 - 0"}<br></br>
                    {" = 5,388,925"}<br></br><br></br>
                    <b>{i18n.t("static.supplyPlan.endingBalance")}</b><br></br>
                    {i18n.t("static.showFormula.endingBalance3")}<br></br>
                    {"= " + i18n.t("static.supplyPlan.max") + " (5,388,925 , 0)"}<br></br>
                    {"= 5,388,925"}<br></br>
                    <br></br>
                    <b>{i18n.t("static.showFormula.endingBalance4")}</b><br></br>
                    {i18n.t("static.showFormula.endingBalance5")}<br></br>
                    {"= (310,000 * 10) / (31 - 10) "}<br></br>
                    {"= 147,619 "}<br></br>
                    <br></br>
                    <b>{i18n.t("static.supplyPlan.unmetDemandStr")}</b><br></br>
                    {i18n.t("static.showFormula.endingBalance6")}<br></br>
                    {"= 0 + 147,619"}<br></br>
                    {"= 147,619"}
                  </p>
                </ListGroupItemText>
              </ListGroupItem>
              <div className="mt-2">
                <p>{i18n.t("static.supplyPlanFormula.costOfInventoryNote")}</p>
              </div>
            </ListGroup>
          </ModalBody>
        </Modal>
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
      </div>
    );
  }
}
export default SupplyPlanFormulas;

import React, { Component } from 'react';
import {Card, CardBody, CardHeader, Col, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Row,Badge,Button,Collapse } from 'reactstrap';

class SupplyPlanFormulas extends Component {

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: 1,
      accordion: [true, true, true],
      collapse: true,
    };
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  render() {
    return (
      <div className="animated fadeIn">

        <Row>
          <Col sm="12" xl="12">
            <h5></h5>
            <Card>
              {/* <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Formulae</strong>
              </CardHeader> */}
              <CardBody>
                <ListGroup>
                <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Opening Balance</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    <img className="formula-img-mr img-fluid" src="../src/assets/img/Formulas/Opening-balance-formula.png"/>
                    
                    <p><span className="formulastext-p">Example :</span><br></br>
                    
Ending balance for last month = 10,653<br></br>
<br></br>
Opening Balance for current month = Ending balance of last month<br></br>
Opening Balance for current month = 10,653</p>
                    {/* AMC = AVG(Consumption in last 3 months, current month,future 2 months)(Not based on program) */}
                    </ListGroupItemText>
                  </ListGroupItem>
                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Ending Balance</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    <img className="formula-img-mr img-fluid" src="../src/assets/img/Formulas/Ending balance-formula.png"/><br></br>
                    <p><span className="formulastext-p">Example :</span><br></br>
                    Opening balance = 10,653<br></br>
Adjustments = -100<br></br>
Shipments = 19,176<br></br>
Consumption =7,087<br></br>
Expired stock = 642<br></br>
<br></br>
Ending balance = Opening balance + Adjustments + Shipments in account - Consumptions - Expired stock<br></br>
Ending balance = 10,653 + (-100) + 19,176 - 7,087 - 642<br></br>
Ending balance = 22,000</p><br></br>
                    {/* AMC = AVG(Consumption in last 3 months, current month,future 2 months)(Not based on program) */}
                    </ListGroupItemText>
                  </ListGroupItem>
                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Average Monthly Consumption (AMC)</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    <img className="formula-img-mr img-fluid" src="../src/assets/img/Formulas/AMC-Formula.png"/><br></br>
                    <p>* Consider only non zero values. Also future months include current month</p>
                    <p><span className="formulastext-p">Example :</span><br></br>
                    Months in past = 3(Based on program planning unit)<br></br>
                    Months in future = 3(Based on program planning unit)<br></br>
                    Current month = May 2020<br></br>
Consumption in Feb 2020 = 5,000<br></br>
Consumption in Mar 2020 = 6,890<br></br>
Consumption in Apr 2020 = 6,907<br></br>
Consumption in May 2020 = 7,087<br></br>
Consumption in Jun 2020 = 5,678<br></br>
Consumption in Jul 2020 = 6,789<br></br>

<br></br>
AMC =  Consumption in No. of MONTHS_IN_PAST + Consumption in No. of MONTHS_IN_FUTURE/ number of months<br></br>
AMC = (Consumption for Feb,Mar,Apr,May 2020 + June & Jul 2020) / 6<br></br>
AMC = (5,000+6,890+6,907+7,087+5,678+6,789) / 6<br></br>
AMC = 6,392</p>
                    {/* AMC = AVG(Consumption in last 3 months, current month,future 2 months)(Not based on program) */}
                    </ListGroupItemText>
                  </ListGroupItem>
                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Min Stock</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    <img className="formula-img-mr img-fluid" src="../src/assets/img/Formulas/Min-Formula.png"/>
                    <p><span className="formulastext-p">Example :</span><br></br>
                    MIN MONTH OF STOCK = 4<br></br>
                    REORDER FREQUENCY = 3<br></br>
                    AMC = 6,392<br></br>
                    Min MoS Guardrail = 3(Based on realm)<br></br>
<br></br>
Min= AMC * MAX (MIN MONTH OF STOCK,Min MoS Guardrail)<br></br>
Min = 6,392 * MAX (4,3)<br></br>
Min = 6,392 * 4<br></br>
Min = 25,568</p>
                    </ListGroupItemText>
                  </ListGroupItem>
                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Max Stock</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    {/* Max = AMC * MIN(MAX(MIN_MONTHS_OF_STOCK,3)+REORDER_FREQUENCY,18) */}
                    <img className="formula-img-mr img-fluid" src="../src/assets/img/Formulas/Max-Formula.png"/>
                    <p><span className="formulastext-p">Example :</span><br></br>
                    MIN MONTH OF STOCK = 4<br></br>
                    REORDER FREQUENCY = 3<br></br>
                    AMC = 6,392<br></br>
                    Max MoS Guardrail = 18(Based on realm)<br></br>
                    Min MoS Guardrail = 3(Based on realm)<br></br>
<br></br>
Max = AMC * MIN ([ MAX(MIN MONTH OF STOCK ,Min MoS Guardrail) + REORDER FREQUENCY ] ,Max MoS Guardrail)<br></br>
Max = 6,392 * MIN ([ MAX(4,3)+3 ] ,18) <br></br>
Max = 6,392 * MIN ([ 4+3 ] ,18)<br></br>
Max = 6,392 * MIN (7,18 )<br></br>
Max = 6,392 * 7<br></br>
Max = 44,744</p>
                    </ListGroupItemText>
                  </ListGroupItem>
                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Min Months Of Stock</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    
                     <img className="formula-img-mr img-fluid" src="../src/assets/img/Formulas/Min-Months-Of-Stock-formula.png"/>
                     <p><span className="formulastext-p">Example :</span><br></br>
                     MIN MONTH OF STOCK = 4<br></br>
                      REORDER FREQUENCY = 3<br></br>
                     Min MoS Guardrail = 3(Based on realm)<br></br>
                    <br></br>
                      Min= MAX (MIN MONTH OF STOCK,Min MoS Guardrail)<br></br>
                      Min = MAX (4,3)<br></br>
                      Min = 4</p>
                    </ListGroupItemText>
                  </ListGroupItem>

                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Max Months Of Stock</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    
                     <img className="formula-img-mr img-fluid" src="../src/assets/img/Formulas/Max-Months-Of-Stock-formula.png"/>
                     <p><span className="formulastext-p">Example :</span><br></br>
                     MIN MONTH OF STOCK = 4<br></br>
                    REORDER FREQUENCY = 3<br></br>
                    Max MoS Guardrail = 18(Based on realm)<br></br>
<br></br>
Max = MIN ( [ MAX(MIN MONTH OF STOCK ,3) + REORDER FREQUENCY ] ,Min MoS Guardrail )<br></br>
Max = MIN ([ MAX(4,3)+3 ] ,18 ) <br></br>
Max = MIN ( [ 4+3 ] ,18 )<br></br>
Max = MIN (7,18 )<br></br>
Max = 7</p>
                    </ListGroupItemText>
                  </ListGroupItem>

                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">When to suggest order</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    
                     <img className="formula-img-mr img-fluid" src="../src/assets/img/Formulas/suggest order-Formula.png"/>
                     <p><span className="formulastext-p">Example :</span><br></br>
Inventory of current month = 24,890<br></br>
Min = 25,568<br></br>
Suggest Order = True</p>
                    </ListGroupItemText>
                  </ListGroupItem>

                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Suggested Order Qty</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    
                     <img className="formula-img-mr img-fluid" src="../src/assets/img/Formulas/suggest order qty-Formula.png"/>
                     <p><span className="formulastext-p">Example :</span><br></br>
                     Max = 44,744<br></br>
                    Min = 25,568<br></br>
<br></br>
Suggested Order Qty = Max - Min<br></br>
Suggested Order Qty = 44,744 - 25,568<br></br>
Suggested Order Qty = 19,176</p>
                    </ListGroupItemText>
                  </ListGroupItem>

                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Months Of Stock</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    
                     <img className="formula-img-mr img-fluid" src="../src/assets/img/Formulas/Month0fstock-Formula.png"/>
                     <p><span className="formulastext-p">Example :</span><br></br>
                     Ending Balance = 22,642<br></br>
AMC = 6,392<br></br>
<br></br>
Months Of Stock = Ending Balance / AMC<br></br>
Months Of Stock = 22,642 / 6,392<br></br>
Months Of Stock = 3.54</p>
                    </ListGroupItemText>
                  </ListGroupItem>

                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Cost Of Inventory</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    
                     <img className="formula-img-mr img-fluid" src="../src/assets/img/Formulas/Cost-Of-Inventory.png"/>
                    
                    </ListGroupItemText>
                  </ListGroupItem>

                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Inventory Turns</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    
                     <img className="formula-img-mr img-fluid" src="../src/assets/img/Formulas/Inventory Turns.png"/>
                    
                    </ListGroupItemText>
                  </ListGroupItem>

                  
                </ListGroup>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default SupplyPlanFormulas;

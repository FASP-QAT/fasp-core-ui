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
    this.toggleAccordion=this.toggleAccordion.bind(this);
  }

  toggleAccordion(tab) {

    const prevState = this.state.accordion;
    const state = prevState.map((x, index) => tab === index ? !x : false);

    this.setState({
      accordion: state,
    });
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
              <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Supply Plan Formulae</strong>
              </CardHeader>
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
Consumption 7,087<br></br>
<br></br>
Ending balance = Opening balance + Adjustments + shipments in account - consumptions<br></br>
Ending balance = 10,653 + (-100) + 19,176 - 7,087<br></br>
Ending balance = 22,642</p><br></br>
                    {/* AMC = AVG(Consumption in last 3 months, current month,future 2 months)(Not based on program) */}
                    </ListGroupItemText>
                  </ListGroupItem>
                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Average Monthly Consumption (AMC)</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    <img className="formula-img-mr img-fluid" src="../src/assets/img/Formulas/AMC-Formula.png"/><br></br>
                    <p>* Consider non zero values over a 12 month range in case a few values are zero/not available while taking AMC</p>
                    <p><span className="formulastext-p">Example :</span><br></br>
                    Current month = May 2020<br></br>
Consumption in Feb 2020 = 5,000<br></br>
Consumption in Mar 2020 = 6,890<br></br>
Consumption in Apr 2020 = 6,907<br></br>
Consumption in May 2020 = 7,087<br></br>
Consumption in Jun 2020 = 5,678<br></br>
Consumption in Jul 2020 = 6,789<br></br>
<br></br>
AMC = Consumption in last 3 months + current month + Next 2 months / number of months(Consider + or - 12 months )<br></br>
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
<br></br>
Min= AMC * MAX (MIN MONTH OF STOCK,3)<br></br>
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
<br></br>
Max = AMC * MIN  ( [ MAX(MIN MONTH OF STOCK ,3) + REORDER FREQUENCY ] ,18 )<br></br>
Max = 6,392 * MIN ( [ MAX(4,3)+3 ] ,18 )<br></br>
Max = 6,392 * MIN ( [ 4+3 ] ,18 )<br></br>
Max = 6,392 * MIN ( 7,18 )<br></br>
Max = 6,392 * 7<br></br>
Max = 44,744</p>
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

                  
                </ListGroup>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Col xl="6">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i> Collapse <small>accordion</small>
                <div className="card-header-actions">
                  <Badge>NEW</Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div id="accordion">
                  <Card className="mb-0">
                    <CardHeader id="headingOne">
                      <Button block color="link" className="text-left m-0 p-0" onClick={() => this.toggleAccordion(0)} aria-expanded={this.state.accordion[0]} aria-controls="collapseOne">
                        <h5 className="m-0 p-0">Collapsible Group Item #1</h5>
                      </Button>
                    </CardHeader>
                    <Collapse isOpen={this.state.accordion[0]} data-parent="#accordion" id="collapseOne" aria-labelledby="headingOne">
                      <CardBody>
                        1. Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non
                        cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird
                        on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred
                        nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft
                        beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
                      </CardBody>
                    </Collapse>
                  </Card>
                  <Card className="mb-0">
                    <CardHeader id="headingTwo">
                      <Button block color="link" className="text-left m-0 p-0" onClick={() => this.toggleAccordion(1)} aria-expanded={this.state.accordion[1]} aria-controls="collapseTwo">
                        <h5 className="m-0 p-0">Collapsible Group Item #2</h5>
                      </Button>
                    </CardHeader>
                    <Collapse isOpen={this.state.accordion[1]} data-parent="#accordion" id="collapseTwo">
                      <CardBody>
                        2. Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non
                        cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird
                        on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred
                        nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft
                        beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
                      </CardBody>
                    </Collapse>
                  </Card>
                  <Card className="mb-0">
                    <CardHeader id="headingThree">
                      <Button block color="link" className="text-left m-0 p-0" onClick={() => this.toggleAccordion(2)} aria-expanded={this.state.accordion[2]} aria-controls="collapseThree">
                        <h5 className="m-0 p-0">Collapsible Group Item #3</h5>
                      </Button>
                    </CardHeader>
                    <Collapse isOpen={this.state.accordion[2]} data-parent="#accordion" id="collapseThree">
                      <CardBody>
                        3. Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non
                        cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird
                        on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred
                        nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft
                        beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
                      </CardBody>
                    </Collapse>
                  </Card>
                </div>
              </CardBody>
            </Card>
            </Col>
      </div>
    );
  }
}

export default SupplyPlanFormulas;

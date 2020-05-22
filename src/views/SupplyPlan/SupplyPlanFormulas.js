import React, { Component } from 'react';
import {Card, CardBody, CardHeader, Col, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Row } from 'reactstrap';

class SupplyPlanFormulas extends Component {

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: 1
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
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Supply Plan Formulas</strong>
              </CardHeader>
              <CardBody>
                <ListGroup>
                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">AMC</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    AMC = AVG(Consumption in last 3 months, current month,future 2 months)(Not based on program)
                    </ListGroupItemText>
                  </ListGroupItem>
                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Min Stock</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    Min = AMC * MAX(MIN_MONTHS_OF_STOCK,3)
                    </ListGroupItemText>
                  </ListGroupItem>
                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Max Stock</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    Max = AMC * MIN(MAX(MIN_MONTHS_OF_STOCK,3)+REORDER_FREQUENCY,18)
                    </ListGroupItemText>
                  </ListGroupItem>
                  <ListGroupItem action>
                    <ListGroupItemHeading className="formulasheading">Suggested Order</ListGroupItemHeading>
                    <ListGroupItemText className="formulastext">
                    Suggested Order = MAX - MIN
                    When to suggest an order = Inventory  MIN
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

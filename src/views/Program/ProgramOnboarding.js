import React, { Component } from 'react';
import {
    Row, Col, Card, CardHeader, CardFooter, Button,
    CardBody, Modal, ModalBody, ModalFooter, ModalHeader,
    ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText,
    TabContent, TabPane
} from 'reactstrap';


export default class ProgramOnboarding extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            large: false,
            small: false,
            primary: false,
            success: false,
            warning: false,
            danger: false,
            info: false,
            activeTab: 0
        };
        this.toggleLarge = this.toggleLarge.bind(this);
        this.toggle = this.toggle.bind(this);
    }
    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }
    toggleLarge() {
        this.setState({
            large: !this.state.large,
        });
    }
    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>Program Onboarding</strong>{' '}
                            </CardHeader>
                            <CardBody>
                                <Button type="button" onClick={this.toggleLarge} size="md" color="success" className="float-right mr-1">Add Program</Button>
                                <Modal isOpen={this.state.large} toggle={this.toggleLarge}
                                    className={'modal-lg ' + this.props.className}>
                                    <ModalHeader toggle={this.toggleLarge}>Program Onboarding</ModalHeader>
                                    <ModalBody>
                                        <Row>
                                            <Col xs="4">
                                                <ListGroup id="list-tab" role="tablist">
                                                    <ListGroupItem onClick={() => this.toggle(0)} action active={this.state.activeTab === 0} >What is Program ?</ListGroupItem>
                                                    <ListGroupItem onClick={() => this.toggle(1)} action active={this.state.activeTab === 1} >Country</ListGroupItem>
                                                    <ListGroupItem onClick={() => this.toggle(2)} action active={this.state.activeTab === 2} >Health Area</ListGroupItem>
                                                    <ListGroupItem onClick={() => this.toggle(3)} action active={this.state.activeTab === 3} >Organization</ListGroupItem>
                                                    <ListGroupItem onClick={() => this.toggle(4)} action active={this.state.activeTab === 4} >Create Program</ListGroupItem>
                                                </ListGroup>
                                            </Col>
                                            <Col xs="8">
                                                <TabContent activeTab={this.state.activeTab}>
                                                    <TabPane tabId={0} >
                                                        <p>Velit aute mollit ipsum ad dolor consectetur nulla officia culpa adipisicing exercitation fugiat tempor. Voluptate deserunt sit sunt
                                                          nisi aliqua fugiat proident ea ut. Mollit voluptate reprehenderit occaecat nisi ad non minim
                                                          tempor sunt voluptate consectetur exercitation id ut nulla. Ea et fugiat aliquip nostrud sunt incididunt consectetur culpa aliquip
                                                        eiusmod dolor. Anim ad Lorem aliqua in cupidatat nisi enim eu nostrud do aliquip veniam minim.
                                                        Velit aute mollit ipsum ad dolor consectetur nulla officia culpa adipisicing exercitation fugiat tempor. Voluptate deserunt sit sunt
                                                          nisi aliqua fugiat proident ea ut. Mollit voluptate reprehenderit occaecat nisi ad non minim
                                                          tempor sunt voluptate consectetur exercitation id ut nulla. Ea et fugiat aliquip nostrud sunt incididunt consectetur culpa aliquip
                                                        eiusmod dolor. Anim ad Lorem aliqua in cupidatat nisi enim eu nostrud do aliquip veniam minim.
                          </p>
                                                    </TabPane>
                                                    <TabPane tabId={1}>
                                                        <p>Cupidatat quis ad sint excepteur laborum in esse qui. Et excepteur consectetur ex nisi eu do cillum ad laborum. Mollit et eu officia
                                                          dolore sunt Lorem culpa qui commodo velit ex amet id ex. Officia anim incididunt laboris deserunt
                                                          anim aute dolor incididunt veniam aute dolore do exercitation. Dolor nisi culpa ex ad irure in elit eu dolore. Ad laboris ipsum
                          reprehenderit irure non commodo enim culpa commodo veniam incididunt veniam ad.</p>
                                                    </TabPane>
                                                    <TabPane tabId={2}>
                                                        <p>Ut ut do pariatur aliquip aliqua aliquip exercitation do nostrud commodo reprehenderit aute ipsum voluptate. Irure Lorem et laboris
                                                          nostrud amet cupidatat cupidatat anim do ut velit mollit consequat enim tempor. Consectetur
                                                          est minim nostrud nostrud consectetur irure labore voluptate irure. Ipsum id Lorem sit sint voluptate est pariatur eu ad cupidatat et
                                                          deserunt culpa sit eiusmod deserunt. Consectetur et fugiat anim do eiusmod aliquip nulla
                          laborum elit adipisicing pariatur cillum.</p>
                                                    </TabPane>
                                                    <TabPane tabId={3}>
                                                        <p>Irure enim occaecat labore sit qui aliquip reprehenderit amet velit. Deserunt ullamco ex elit nostrud ut dolore nisi officia magna
                                                          sit occaecat laboris sunt dolor. Nisi eu minim cillum occaecat aute est cupidatat aliqua labore
                                                          aute occaecat ea aliquip sunt amet. Aute mollit dolor ut exercitation irure commodo non amet consectetur quis amet culpa. Quis ullamco
                                                          nisi amet qui aute irure eu. Magna labore dolor quis ex labore id nostrud deserunt dolor
                          eiusmod eu pariatur culpa mollit in irure.</p>
                                                    </TabPane>
                                                    <TabPane tabId={4}>
                                                        <p>Irure enim occaecat labore sit qui aliquip reprehenderit amet velit. Deserunt ullamco ex elit nostrud ut dolore nisi officia magna
                                                          sit occaecat laboris sunt dolor. Nisi eu minim cillum occaecat aute est cupidatat aliqua labore
                                                          aute occaecat ea aliquip sunt amet. Aute mollit dolor ut exercitation irure commodo non amet consectetur quis amet culpa. Quis ullamco
                                                          nisi amet qui aute irure eu. Magna labore dolor quis ex labore id nostrud deserunt dolor
                          eiusmod eu pariatur culpa mollit in irure.</p>
                                                    </TabPane>
                                                </TabContent>
                                            </Col>
                                        </Row>
                                    </ModalBody>
                                    <ModalFooter>
                                        {/* <Button color="primary" onClick={this.toggleLarge}>Do Something</Button>{' '} */}
                                        <Button color="secondary" onClick={this.toggleLarge}>Skip</Button>
                                    </ModalFooter>
                                </Modal>

                            </CardBody>
                            <CardFooter>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>

            </div>
        );
    }
}

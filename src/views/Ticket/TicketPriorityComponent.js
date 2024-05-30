import classNames from 'classnames';
import { Formik } from 'formik';
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, ModalFooter, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX, SPECIAL_CHARECTER_WITH_NUM_NODOUBLESPACE } from '../../Constants';
import i18n from '../../i18n';
export default class TicketPriorityComponent extends Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     priority: ''
        // }
        // this.updatePriority = this.updatePriority.bind(this);
        this.changePriority = this.changePriority.bind(this);
    }

    /*updatePriority(event){
        // let priority  = this.state.priority;
        let priority = event.target.value;
        console.log('priority : '+priority);
        this.setState(
            {
                priority
            }, () => {

                console.log('priority - state : '+this.state.priority);
            }
        );
    }*/

    changePriority(event) {
        this.props.updatePriority(event.target.value);
    }

    render() {        
        return (
            <div className="col-md-12">
                <Label for="realm" style={{marginLeft:'-14px'}}>{i18n.t('static.priority')}<span class="red Reqasterisk">*</span></Label>
                <Row>
                    {/* <FormGroup check inline> */}
                    <Col sm={1} md={1} className="text-md-center pr-0 pl-0">
                        <Input

                            className="form-check-input"
                            type="radio"
                            id="priority1"
                            name="priority"
                            value={1}
                            checked={this.props.priority == 1 ? true: false}
                            onChange={(e) => {this.changePriority(e) }}
                        />
                    </Col>
                    <Col sm={11} md={11} className=" text-md-left pl-0">
                        <Label
                            className="form-check-label"
                            check htmlFor="inline-radio1">
                            {i18n.t('static.priority.highest')}: <span>{i18n.t('static.priority.highestDesc')}</span>
                        </Label>
                    </Col>
                    {/* </FormGroup> */}
                </Row>

                <Row>
                    {/* <FormGroup check inline> */}
                    <Col sm={1} md={1} className="text-md-center pr-0 pl-0">
                        <Input

                            className="form-check-input"
                            type="radio"
                            id="priority2"
                            name="priority"
                            value={2}
                        // onChange={(e) => { handleChange(e); this.dataChange(e) }}
                            checked={this.props.priority == 2 ? true: false}
                            onChange={(e) => {this.changePriority(e) }}
                        />
                    </Col>
                    <Col sm={11} md={11} className=" text-md-left pl-0">
                        <Label
                            className="form-check-label"
                            check htmlFor="inline-radio1">
                            {i18n.t('static.priority.high')}: <span>{i18n.t('static.priority.highDesc')}</span>
                        </Label>
                    </Col>
                    {/* </FormGroup> */}
                </Row>
                <Row>
                    <Col sm={1} md={1} className="text-md-center pr-0 pl-0">
                        <Input

                            className="form-check-input"
                            type="radio"
                            id="priority3"
                            name="priority"
                            value={3}
                            checked={this.props.priority == 3 ? true: false}
                            onChange={(e) => {this.changePriority(e) }}
                        // onChange={(e) => { handleChange(e); this.dataChange(e) }}
                        />
                    </Col>
                    <Col sm={11} md={11} className=" text-md-left pl-0">
                        <Label
                            className="form-check-label"
                            check htmlFor="inline-radio1">
                            {i18n.t('static.priority.medium')}: <span>{i18n.t('static.priority.mediumDesc')}</span>
                        </Label>
                    </Col>
                </Row>
                <Row>
                    <Col sm={1} md={1} className="text-md-center pr-0 pl-0">
                        <Input

                            className="form-check-input"
                            type="radio"
                            id="priority4"
                            name="priority"
                            value={4}
                            checked={this.props.priority == 4 ? true: false}
                            onChange={(e) => {this.changePriority(e) }}
                        // onChange={(e) => { handleChange(e); this.dataChange(e) }}
                        />
                    </Col>
                    <Col sm={11} md={11} className=" text-md-left pl-0">
                        <Label
                            className="form-check-label"
                            check htmlFor="inline-radio1">
                            {i18n.t('static.priority.low')}: <span>{i18n.t('static.priority.lowDesc')}</span>
                        </Label>
                    </Col>
                </Row>
            </div>
        );
    }
}
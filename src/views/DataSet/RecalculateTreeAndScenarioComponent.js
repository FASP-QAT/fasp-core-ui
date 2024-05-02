import { Formik } from 'formik';
import React, { Component } from 'react';
import 'react-select/dist/react-select.min.css';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import { API_URL, SPECIAL_CHARECTER_WITHOUT_NUM } from '../../Constants.js';
import LanguageService from '../../api/LanguageService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
class RecalculateTreeAndScenarioComponent extends Component {
    render(){
        return(
            <h5>New page</h5>
        );
    }
}
export default RecalculateTreeAndScenarioComponent;
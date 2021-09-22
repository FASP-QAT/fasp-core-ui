import React, { Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
class BuildTree extends Component {

    constructor(props) {
        super(props);
        this.state={
            treeId:this.props.match.params.treeId,
            templateId:this.props.match.params.templateId
        }

    }

    componentDidMount() {

    }

    render() {

        return (

            <>
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h3>Hello User {this.state.treeId} {this.state.templateId}</h3>
            </>

        );

    }

}

export default BuildTree;
import React, { Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
class TreeTemplate extends Component {

    constructor(props) {
        super(props);
        

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
                <h3>Hello User </h3>
            </>

        );

    }

}

export default TreeTemplate;
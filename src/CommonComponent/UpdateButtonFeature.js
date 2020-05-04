import React, { Component } from "react";
import {
    Button
} from 'reactstrap';

export default class StatusUpdateButtonFeature extends Component {

    render() {
        if (this.props.isRowNew == true) {
            return(
                <></>
            )
        } else {
            return (
                <Button type="button" size="sm" color="info" onClick={() => this.props.updateRow(this.props.rowId)} >Update</Button>
            );
        }
    }

}
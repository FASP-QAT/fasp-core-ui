import React, { Component } from "react";
import {
    Button
} from 'reactstrap';

export default class StatusUpdateButtonFeature extends Component {

    render() {
        if(this.props.isRowNew==true){
            return (
                <Button type="button" size="sm" color="danger" onClick={() => this.props.removeRow(this.props.rowId)} >Remove</Button>
            );
        }else{
        if (this.props.status == true) {
            return (
                <Button type="button" size="sm" color="danger" onClick={() => this.props.disableRow(this.props.rowId)} >Disable</Button>
            );
        } else {
            return (
                <Button type="button" size="sm" color="success" onClick={() => this.props.enableRow(this.props.rowId)} >Enable</Button>
            );
        }
    }
    }

}
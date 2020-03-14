import React, { Component } from "react";



export default class Test extends Component {

    constructor(props) {
        super(props);
        this.state = {
            label: {
                labelId: 1,
                label_en: 'Hello',
                label_sp: 'Hola'
            }
        }
        this.getText=this.getText.bind(this);
    }

    getText(label, lang) {
        if (lang == 'en') {
            return label.label_en
        } else if (lang == 'sp') {
            return label.label_sp
        }

    }
    render() {

        return (
            <>

                <h1>test{this.getText(this.state.label,'sp')}</h1>
            </>
        );
    }
}
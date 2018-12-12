import React, { Component } from 'react';

import LogInPage from './LogInPage'
import Register from './Register'
import Dashboard from './Dashboard'


class LogIn extends Component {
    constructor(props) {
        super(props);
        this.loginRequest = this.loginRequest.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(name,value) {
        this.props.defaultAddressChange(name,value);
    }

    loginRequest(address, opreturns, ipfsData, signaturePolicy) {
        this.props.loginRequest(address, opreturns, ipfsData, signaturePolicy)

    }


    render() {
        const address = this.props.stateApp.address;
        const signaturePolicyState = this.props.stateApp.signaturePolicy

        return (
            <div>
            { address === '' ? <LogInPage stateApp={this.props.stateApp} handleChange={this.handleChange} loginRequest={this.loginRequest} /> : '' }
            { address !== '' &&  signaturePolicyState.newSignaturePolicyReq === true ? <Register stateApp={this.props.stateApp} /> : '' }
            { address !== '' &&  signaturePolicyState.newSignaturePolicyReq === false &&  signaturePolicyState.signaturePolicyVerified === true ? <Dashboard stateApp={this.props.stateApp} /> : '' }
            </div>
        );
    }

}


export default LogIn;
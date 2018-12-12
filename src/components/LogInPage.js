import React, { Component } from 'react';
import TrezorConnect from 'trezor-connect';
import { fetchAddress, extractOPreturns, fetchIPFS, signaturePolicyVerify } from '../functions';

class LogInPage extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);

    }

    handleChange(e) {
        this.props.handleChange(e.target.name, e.target.value);
    }

    async handleLogin() {
      const addressTrezor = await TrezorConnect.getAddress({
            path: "m/" + this.props.stateApp.defaultAddress.no0 + "'/" + this.props.stateApp.defaultAddress.no1 + "'/" + this.props.stateApp.defaultAddress.no2 + "'/" + this.props.stateApp.defaultAddress.no3 + "/" + this.props.stateApp.defaultAddress.no4,
            coin: "LTC"
        });

       const address = addressTrezor.payload.address;
       console.log(address);

        const result = await fetchAddress(address);
        const opreturns = extractOPreturns(result);
        const opreturnValues = opreturns.map((opreturn) => { return opreturn.script });
        const ipfsData = opreturnValues.map(async (opreturnValue) => { return await fetchIPFS(opreturnValue) });
        const ipfsJson = await Promise.all(ipfsData).then((ipfsData) => { return ipfsData });
        const signaturePolicy = signaturePolicyVerify(ipfsJson);
        this.props.loginRequest(address, opreturns, ipfsJson, signaturePolicy);
    }

    render() {
        const no0 = this.props.stateApp.defaultAddress.no0;
        const no1 = this.props.stateApp.defaultAddress.no1;
        const no2 = this.props.stateApp.defaultAddress.no2;
        const no3 = this.props.stateApp.defaultAddress.no3;
        const no4 = this.props.stateApp.defaultAddress.no4;
        return (
            <div>
              <div className="text-center">
                <h1 className="display-4">How to Login</h1>
                <p className="lead">We are currently in PoC phase and support only login through Trezor.</p>
                <div className="row bip-nums">
                    <form className="form-inline">
                      <label className="form-check-label"> m/ </label>
                      <input type="number" className="form-control mb-2 mr-sm-2 bipval" min="0" max="99" name="no0" value={no0} onChange={this.handleChange} /> 
                      <label className="form-check-label"> '/ </label>
                      <input type="number" className="form-control mb-2 mr-sm-2 bipval" min="0" max="99" name="no1" value={no1} onChange={this.handleChange} /> 
                      <label className="form-check-label"> '/ </label>
                      <input type="number" className="form-control mb-2 mr-sm-2 bipval" min="0" max="99" name="no2" value={no2} onChange={this.handleChange} /> 
                      <label className="form-check-label"> '/ </label>
                      <input type="number" className="form-control mb-2 mr-sm-2 bipval" min="0" max="99" name="no3" value={no3} onChange={this.handleChange} /> 
                      <label className="form-check-label"> / </label>
                      <input type="number" className="form-control mb-2 mr-sm-2 bipval" min="0" max="99" name="no4" value={no4} onChange={this.handleChange} /> 
                    </form>
                </div>
                <button className="btn btn-primary btn-lg" onClick={this.handleLogin}>Use Trezor to log in</button>
              </div>
			</div>

        );
    }
}


export default LogInPage;
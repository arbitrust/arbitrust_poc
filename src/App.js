import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.svg';

import Home from './components/Home';
import Users from './components/Users';
import LogIn from './components/LogIn';
import LogOut from './components/LogOut';
import Footer from './components/Footer';


import './App.css';


class App extends Component {
    constructor(props) {
        super(props);
        this.loginRequest = this.loginRequest.bind(this);
        this.logoutRequest = this.logoutRequest.bind(this);
        this.defaultAddressChange = this.defaultAddressChange.bind(this);
        this.state = {
          address: '',
          signaturePolicy: {
            signaturePolicyVerified: false,
            newSignaturePolicyReq: false,
            error: false
          },
          defaultAddress: { 
            no0: 44,
            no1: 2,
            no2: 0,
            no3: 0,
            no4: 0 
          },
          opreturns: [],
          ipfsData: {}
        };
    }

    loginRequest(address, opreturns, ipfsData, signaturePolicy) {
        this.setState({ address: address, opreturns: opreturns, ipfsData: ipfsData, signaturePolicy: signaturePolicy });

    }

    defaultAddressChange(name, value) {
        this.setState({
            defaultAddress: Object.assign({}, this.state.defaultAddress, {
                [name]: value,
            }),
        });
    }

    logoutRequest() {
        // TO DO for all elements in state remove
        this.setState({
          address: '',
          signaturePolicy: {
            signaturePolicyVerified: false,
            newSignaturePolicyReq: false,
            error: false
          },
          defaultAddress: { 
            no0: 44,
            no1: 2,
            no2: 0,
            no3: 0,
            no4: 0 
          },
          opreturns: [],
          ipfsData: []
        });
    }
//                      <p>Welcome, <strong>{ name !== '' && {name}} { surname !== '' && {surname}}</strong></p>
//                      <p>Your verified address is { addressIPFS !== '' && {addressIPFS}}</p>

    render() {
        const address = this.state.address;
        return (
            <div className="App">

            <Router>
              <div>
                <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom shadow-sm no-print">
                  <h5 className="my-0 mr-md-auto font-weight-normal">Arbitrust</h5>
                  <nav className="my-2 my-md-0 mr-md-3">
                    <Link className="p-2 text-dark" to="/">Home</Link>
                    <Link className="p-2 text-dark" to="/arbiters/">Arbiters</Link>
                    { address && (<Link className="p-2 text-dark" to="/app/">Dashboard</Link>) }

                  </nav>
                  { address ? (<Link className="btn btn-outline-primary" to="/log-out/" onClick={this.logoutRequest}>Log Out</Link>) : (<Link className="btn btn-outline-primary" to="/app/" >Log In</Link>) }
                </div>
                <div className="container">
                  <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/arbiters/" exact component={Users} />
                    <Route path="/app/" render={props => <LogIn {...props} stateApp={this.state} loginRequest={this.loginRequest} defaultAddressChange={this.defaultAddressChange} />} />
                    <Route path="/log-out/" exact component={LogOut} />
                  </Switch>
                  <Footer />
                </div>
              </div>
            </Router>
        </div>
        );
    }
}

export default App;
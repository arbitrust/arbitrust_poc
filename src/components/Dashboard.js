import React, { Component } from 'react';
import TrezorConnect from 'trezor-connect';
import { fetchAddress, extractOPreturns, ascii2hex, actionVerify, fetchIPFSAction, arbitratorSelection } from '../functions';

const serverIPFSAPI = "http://185.8.164.22:8000";
const IPFSgateway = "https://cloudflare-ipfs.com/ipfs/";
const arbitrustWallet = "LhErzcYa4aku8xnSxA5YhivLLYMTHfNQhQ";
const arbitrustFee = "2000";

const poolOfArbiters = [{"firstname":"Emil","surname":"Zachar","birthdate":"1846-01-18","wallet":"LRyLqfxH7dPYWmSjDqtnKhHNazdfu1p7zK","state":"SK","language":["cs","sk"]},{"firstname":"Aladár","surname":"Wahlner","birthdate":"1861-02-01","wallet":"LLURMmaVHnN8b1afbW9Wci4hMNPqKTbzcH","state":"SK","language":["cs","sk"]},{"firstname":"František","surname":"Hánrich","birthdate":"1800-09-15","wallet":"LaifQQoNFMkKizNoc5rrUShymBSLBdHpxW","state":"SK","language":["en","sk"]},{"firstname":"Alois","surname":"Rašín","birthdate":"1867-10-18","wallet":"LULzbuU5BRo5pcP17HEnPZZKEiTbFMu2KG","state":"CZ","language":["cs","sk"]},{"firstname":"Vladimír","surname":"Fajnor","birthdate":"1980-01-01","wallet":"LYRXVgjRae9BjjpAfp3KpVFTmem51muDfJ","state":"SK","language":["cs","sk"]},{"firstname":"Štefan","surname":"Luby","birthdate":"1980-01-01","wallet":"LXCyJaVdbka1LEXFp7rDWxzTWTHrMUGBom","state":"SK","language":["cs","sk"]},{"firstname":"Adolf","surname":"Záturecký","birthdate":"1980-01-01","wallet":"LV6ACXPbof6sAV89gPHkQonfkpzVBVAbqd","state":"SK","language":["en","cs","sk"]},{"firstname":"Emil","surname":"Svoboda","birthdate":"1878-10-02","wallet":"LgFyQ9yL67DPRcH9oXQnGof9uT8uzuBd8W","state":"CZ","language":["en","cs","sk"]},{"firstname":"Emil","surname":"Stodola","birthdate":"1862-03-22","wallet":"LTVQi4Zckc1jacEyZBs8x3ADH8hRo8yoBR","state":"SK","language":["en","cs","sk"]},{"firstname":"Augustín","surname":"Ráth","birthdate":"1873-06-02","wallet":"LYS1pzYyNjKfEgnc1WKaZoTix9vj1afgn9","state":"SK","language":["en","cs","sk"]}]

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fileAttached: false,
            statusUpload: null,
            verFileHashIPFS: '',
            errorUploadText: '',
            defendantAddress: '',
            actionSuccess: '',
            txidAction: '',
            actionsData: []


        };

        this.handleAttachmentChange = this.handleAttachmentChange.bind(this);
        this.handleUploadImage = this.handleUploadImage.bind(this);
        this.composeTransaction = this.composeTransaction.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.viewActions = this.viewActions.bind(this);
    }

    handleChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        })
    }


    handleAttachmentChange(e) {
        this.refs.fileUploader.click();
        if (this.refs.fileUploader.files[0]) {
            this.setState({ fileAttached: true });
        } else {
            this.setState({ fileAttached: false });
        }
        this.forceUpdate();

    }


    handleUploadImage(ev) {
        ev.preventDefault();

        const data = new FormData();
        data.append('file', this.refs.fileUploader.files[0]);
        data.append('filename', this.refs.fileUploader.files[0].name);

        fetch(serverIPFSAPI + "/upload", { method: 'POST', body: data })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    return { statusUpload: res.status, errorUploadText: res.statusText }
                }
            })
            .then((result) => {
                    this.setState({ verFileHashIPFS: result.verFileHashIPFS, statusUpload: result.statusUpload, errorUploadText: result.errorUploadText });

                },
                (error) => {
                    console.log(error);
                }
            );
    }

    async composeTransaction() {

        let data = {
            type: "arbitrationAction",
            plaintiff: this.props.stateApp.address,
            defendant: this.state.defendantAddress,
            actionFile: this.state.verFileHashIPFS
        }

        let IPFShahAction = await fetch(serverIPFSAPI + "/register", { method: 'POST', headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(data) })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    return { statusUpload: res.status, errorUploadText: res.statusText }
                }
            })
            .then((result) => {
                    return result.verJsonHashIPFS

                },
                (error) => {
                    console.log(error);
                }
            );

        const opreturnRegistration = await TrezorConnect.composeTransaction({
            outputs: [{ type: "opreturn", dataHex: ascii2hex(IPFShahAction) }, { amount: arbitrustFee, address: arbitrustWallet }],
            coin: "LTC",
            push: true
        });
        if (opreturnRegistration.success === true) {
            this.setState({ actionSuccess: true, txidAction: opreturnRegistration.payload.txid });
        };

        // Return all funds to previous address (will be probably replaced by scanning chain)
        await TrezorConnect.composeTransaction({
            outputs: [{ type: "send-max", address: this.props.stateApp.address }],
            coin: "LTC",
            push: true
        });

    }

    async viewActions() {
        const result = await fetchAddress(this.props.stateApp.address);
        const opreturns = extractOPreturns(result);
        const ipfsData = opreturns.map(async (opreturnValue) => { return await fetchIPFSAction(opreturnValue) });
        const ipfsJson = await Promise.all(ipfsData).then((ipfsData) => { return ipfsData });
        this.setState({ actionsData: actionVerify(ipfsJson, this.props.stateApp.address) });

    }

    render() {
        const firstname = this.props.stateApp.signaturePolicy.signatureData[0].firstname;
        const surname = this.props.stateApp.signaturePolicy.signatureData[0].surname;
        const wallet = this.props.stateApp.signaturePolicy.signatureData[0].wallet;
        const address = this.props.stateApp.signaturePolicy.signatureData[0].address;
        const zip = this.props.stateApp.signaturePolicy.signatureData[0].zip;
        const city = this.props.stateApp.signaturePolicy.signatureData[0].city;
        const country = this.props.stateApp.signaturePolicy.signatureData[0].country;
        const birthDate = this.props.stateApp.signaturePolicy.signatureData[0].birthDate;
        const verFileHashIPFS = this.props.stateApp.signaturePolicy.signatureData[0].verFileHashIPFS;
        const signatureProofLink = IPFSgateway + verFileHashIPFS;

        const statusUpload = this.state.statusUpload;
        const fileAttached = this.state.fileAttached;
        const errorUploadText = this.state.errorUploadText;
        const newopreturn = this.state.verFileHashIPFS;
        const txidAction = this.state.txidAction;

        const actionsAndArbiters = arbitratorSelection(this.state.actionsData, poolOfArbiters);
        console.log(actionsAndArbiters);
        const actions = this.state.actionsData.map( (action,index) => {
                return (<div className="card" key={index}>
                          <div className="card-header">
                            <a href={IPFSgateway+action.actionFile} rel="noopener noreferrer" target="_blank">{action.actionFile}</a>
                          </div>
                            <div className="card-body">
                                 <p className="card-text"><b>Plaintiff:</b> {action.plaintiff} </p>
                                 <p className="card-text"><b>Defendant:</b> {action.defendant} </p>
                                 <p className="card-text"><b>Block height:</b> {action.block_height} {action.block_height < 100000 ? ' This is not valid selection of arbitrators.' : '' } </p>

                        {action.nonce.map((nonce, index) =>
                              <div  className="card" key={index}>
                              <div className="card-body">
                                <h6 className="card-title"><b>{nonce.selectedArbiter.selectedArbiter.firstname} {nonce.selectedArbiter.selectedArbiter.surname}</b></h6>
                                <p className="card-text">{nonce.selectedArbiter.selectedArbiter.wallet}</p>
                                <p className="card-text">No.: {nonce.selectedArbiter.round}</p>
                                <p className="card-text">Block height: {nonce.block_height}</p>
                                <p className="card-text">Nonce: {nonce.nonce}</p>
                                <p className="card-text">Sum of arbitrators: {nonce.selectedArbiter.arbitratorsSum}</p>
                                <p className="card-text">Selected Arb. No.: {nonce.selectedArbiter.selectedArbiterNo}</p>
                                </div>
                              </div>)}
                            </div>
                     </div>
                     )
        }
        );



        return (
            <div>
                <h1 className="display-4 text-center">Dashboard</h1>
                <div className="shadow-sm p-3 mb-5 bg-white rounded">
                    <h2>{firstname} {surname}</h2>
                    <h6><b>Address</b></h6>
                    <p>{address} {zip} {city} {country}</p>
                    <h6><b>Birth date</b></h6>
                    <p>{birthDate}</p>
                    <h6><b>Wallet</b></h6>
                    <p>{wallet}</p>
                    <h6><b>Protocol</b></h6>
                    <p>Litecoin</p>
                    <h6><b>Signature proof</b></h6>
                    <p><a href={signatureProofLink} rel="noopener noreferrer" target="_blank">{verFileHashIPFS}</a></p>
                </div>

                <h1 className="display-4 text-center">Create an Action</h1>
                <div className="shadow-sm p-3 mb-5 bg-white rounded">
                    <div className="form-row" >
                        <div className="form-group col-md-6">
                          <form onSubmit={this.handleUploadImage}>
                            <div>
                              <input ref="fileUploader" type="file" onChange={this.handleAttachmentChange}/>
                              { fileAttached ? 
                                (<button className="btn btn-outline-primary">Upload</button>) :
                                (<button className="btn btn-outline-primary" disabled>Upload</button>)}
                            </div>
                          </form>
                        </div>
                        <div className="form-group col-md-6">
                          { newopreturn && <p><span className="text-success">Upload was successful</span><br /> {newopreturn}</p>}
                          { statusUpload !== 200 && statusUpload !== null && <p><span className="text-danger">Upload was not successful</span><br /> {errorUploadText}</p>}
                          { !fileAttached && <p><span className="text-muted">No file attached</span></p>}
                        </div>
                    </div>

                        <div className="form-row">
                            <div className="form-group col-md-12">
                              <input type="text" className="form-control" placeholder="Defendant address" name="defendantAddress" id="defendantAddress" value={this.state.defendantAddress} onChange={this.handleChange}/>
                            </div>
                          </div>
                    <div className="row text-center">
                        <button className="btn btn-primary btn-lg no-print csp" onClick={this.composeTransaction}>Submit Action</button>
                    </div>
                    { txidAction ? (<p>Action successfully submitted.<br /> {txidAction}</p>) : ''}

                </div>

                <h1 className="display-4 text-center">Actions</h1>
                <div className="shadow-sm p-3 mb-5 bg-white rounded">
                    <div className="row text-center">
                        <button className="btn btn-primary btn-lg no-print csp" onClick={this.viewActions}>View actions</button>
                    </div>
                    <div className="row">
                        <ul>
                            {actions}
                        </ul>
                    </div>
                </div>

                
            </div>

        );
    }
}


export default Dashboard;
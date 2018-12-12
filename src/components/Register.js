import React, { Component } from 'react';
import QRCode from 'qrcode.react';
import { ascii2hex } from '../functions';
import TrezorConnect from 'trezor-connect';

const serverIPFSAPI = "http://185.8.164.22:8000"
const IPFSgateway = "https://cloudflare-ipfs.com/ipfs/";


class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            address: '',
            verificationReady: false,
            uploadFileReady: false,
            firstname: '',
            surname: '',
            addressHome: '',
            city: '',
            country: '',
            zip: '',
            selectedFile: null,
            loaded: 0,
            uploadFile: false,
            uploadFileError: false,
            birthdate: '',
            verFileHashIPFS: '',
            statusUpload: null,
            errorUploadText: '',
            fileAttached: false,
            verJsonHashIPFS: '',
            registrationSuccess: false,
            txidRegistration:''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleVerificationBttn = this.handleVerificationBttn.bind(this);
        this.handleuploadFile = this.handleuploadFile.bind(this);
        this.handleUploadImage = this.handleUploadImage.bind(this);
        this.handleAttachmentChange = this.handleAttachmentChange.bind(this);
        this.submitData = this.submitData.bind(this);
        this.submitIPFSHash = this.submitIPFSHash.bind(this);


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

    handleVerificationBttn() {
        this.setState({ verificationReady: true, uploadFileReady: false });
    }

    handleuploadFile() {
        this.setState({ verificationReady: false, uploadFileReady: true });
    }


    printPage() {
        window.print();
    }



    handleUploadImage(ev) {
        ev.preventDefault();

        const data = new FormData();
        data.append('file', this.refs.fileUploader.files[0]);
        data.append('filename', this.refs.fileUploader.files[0].name);

        fetch(serverIPFSAPI+"/upload", { method: 'POST', body: data })
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

    submitData() {

        let data = {
            type: "signaturePolicy",
            firstname: this.state.firstname,
            surname: this.state.surname,
            address: this.state.addressHome,
            birthdate: this.state.birthdate,
            wallet: this.props.stateApp.address,
            city: this.state.city,
            country: this.state.country,
            zip: this.state.zip,
            verFileHashIPFS: this.state.verFileHashIPFS
        }


        fetch(serverIPFSAPI+"/register", { method: 'POST', headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(data) })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    return { statusUpload: res.status, errorUploadText: res.statusText }
                }
            })
            .then((result) => {
                    this.setState({ verJsonHashIPFS: result.verJsonHashIPFS });

                },
                (error) => {
                    console.log(error);
                }
            );

    }

    async submitIPFSHash() {

        // Sumbit OP_RETURN
        const opreturnRegistration = await TrezorConnect.composeTransaction({
            outputs: [{ type: "opreturn", dataHex: ascii2hex(this.state.verJsonHashIPFS) }],
            coin: "LTC",
            push: true
        });
        if(opreturnRegistration.success === true){
              this.setState({ registrationSuccess: true, txidRegistration: opreturnRegistration.payload.txid });
        };

        // Return all funds to previous address (will be probably replaced by scanning chain)
        await TrezorConnect.composeTransaction({
            outputs: [{ type: "send-max", address: this.props.stateApp.address }],
            coin: "LTC",
            push: true
        });


    }


    render() {
        const verificationReady = this.state.verificationReady;
        const uploadFileReady = this.state.uploadFileReady;
        const address = this.props.stateApp.address;
        const addressHome = this.state.addressHome;
        const verFileHashIPFS = this.state.verFileHashIPFS;
        const statusUpload = this.state.statusUpload;
        const errorUploadText = this.state.errorUploadText;
        const fileAttached = this.state.fileAttached;
        const verJsonHashIPFS = this.state.verJsonHashIPFS;
        const registrationSuccess = this.state.registrationSuccess;
        const txidRegistration = this.state.txidRegistration;


        return (
            <div>
                <h1 className="display-4 text-center no-print">Register</h1>
                <div className="no-print">
                    <p>We are here to provide confidentiality to your interactions. We are aware of difficulty to use eIDAS and 
                    slowness of state courts. Everything you put here will be visible for everyone on internet, but for better performance of justice and auditability
                     it is necessary for everyone to easily verify your identity. Let's fill the form.</p>
                     <ol>
                         <li>Fill the form.</li>
                         <li>Print it  and verify your signature in a nottary office.</li>
                         <li>Ask a nottary to convert a document.</li>
                         <li>Upload the document and verify yourself. (All data will be public on the blockchain and IPFS - internet.)</li>
                     </ol>
                 </div>
                { verificationReady === true || uploadFileReady === true ? '' : (<div className="text-center"><button className="btn btn-primary btn-lg" onClick={this.handleVerificationBttn}>I am ready for verification of my identity</button></div>)}
                { verificationReady === true ? (
                <div>
                    <h2 className="display-4 text-center">Create Signature Policy</h2>
                    <div className="text-center">
                        <button className="btn btn-primary btn-lg no-print csp" onClick={this.printPage}>Print Page</button>
                        <button className="btn btn-primary btn-lg no-print csp" onClick={this.handleuploadFile}>Upload verified file</button></div>
                    <div className="shadow-sm p-3 mb-5 bg-white rounded">


                         <div className="no-print">
                          <p>This form will help you to create signing policy and delivery agreement. Main purpose is identification of contractual party and agreement on delivery policy.</p>
                          
                          <div className="form-row" >
                            <div className="form-group col-md-4">
                              <input type="text" className="form-control" placeholder="First name" name="firstname" id="firstname" value={this.state.firstname} onChange={this.handleChange}/>
                            </div>
                            <div className="form-group col-md-4">
                              <input type="text" className="form-control" placeholder="Last name" name="surname" id="surname" value={this.state.surname} onChange={this.handleChange}/>
                            </div>
                            <div className="form-group col-md-1">
                            <p>Birth</p></div>
                            <div className="form-group col-md-3">
                              <input type="date" className="form-control" placeholder="Birth Date" name="birthdate" id="birthdate" value={this.state.birthdate} onChange={this.handleChange}/>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group col-md-12">
                              <input type="text" className="form-control" placeholder="Address" name="addressHome" id="addressHome" value={this.state.addressHome} onChange={this.handleChange}/>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <input type="text" className="form-control" placeholder="City" name="city" id="city" value={this.state.city} onChange={this.handleChange}/>
                            </div>
                            <div className="form-group col-md-4">
                              <input type="text" className="form-control" placeholder="State" name="country" id="country" value={this.state.country} onChange={this.handleChange}/>
                            </div>
                            <div className="form-group col-md-2">
                              <input type="text" className="form-control" placeholder="ZIP" name="zip" id="zip" value={this.state.zip} onChange={this.handleChange}/>
                            </div>
                          </div>


                        </div>

                            <hr />
                            <div className="row">
                              <table className="table table-borderless">
                                <tbody>
                                  <tr>
                                    <td> 
                                      <div className="form-row">
                                        <div className="col-md-4">
                                          <QRCode value={address} />
                                        </div>
                                        <div className="col-md-4">
                                          <strong>{this.state.firstname} {this.state.surname}<br />
                                          {this.state.birthdate} <br />
                                          {addressHome} {this.state.city} {this.state.zip} <br />
                                          {this.state.country}</strong>
                                        </div>
                                        <p>{address}</p>
                                      </div>
                                          <br />I. Electronic signature<br />
                                          For the purpose of elecronic identification, creation and establishing trust between relying party and signatory 
                                          in contractual binding in written form I hereby declare and oblige, that I will use for authentication 
                                          and for elektronic signing cryptographic tools of crypto currency wallet Bitcoin Core and specifically private key 
                                          bined to an address<br />
                                          <strong>{address}</strong><br />
                                          If address contains sent transaction with OP_RETURN "KEYREVOKED" (text) nebo "4b45595245564f4b4544" (hex), key has been revoked from that moment.
                                          Key is valid for 2 years.
                                      </td>
                                    <td>
                                      <div className="form-row">
                                        <div className="col-md-4">
                                          <QRCode value={address} />
                                        </div>
                                        <div className="col-md-4">
                                          <strong>{this.state.firstname} {this.state.surname}<br />
                                          {this.state.birthdate} <br />
                                          {addressHome} {this.state.city} {this.state.zip} <br />
                                          {this.state.country}</strong>
                                        </div>
                                        <p>{address}</p>
                                      </div>
                                          <br />I. Elektronický podpis<br />
                                          Za účelem elektronické identifikace, vytvoření a zachování důvěry mezi spoléhající se stranou a 
                                          podepisující osobou při právním jednání učiněném v písemné formě prohlašuji a zavazuji se, že budu využívat 
                                          k autentizaci a k elektronickému podepisování kryptografické nástroje 
                                          kryptoměnové peněženky Bitcoin Core a to konkrétně privátního klíče spojeného s adresou<br />
                                          <strong>{address}</strong><br />
                                          Pokud z adresy elektronického podpisu odešla transakce s OP_RETURN "KEYREVOKED" (text) nebo "4b45595245564f4b4544" (hex), 
                                          klíč je od daného okamžiku neplatný.
                                          Platnost klíče jsou 2 roky.
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>II. Delivery<hr /></td>
                                    <td>II. Doručování<hr /></td>
                                  </tr>
                                  <tr>
                                    <td><small>REGULATION (EU) No 910/2014 OF THE EUROPEAN PARLIAMENT AND OF THE COUNCIL<br />of 23 July 2014<br />on electronic identification and trust services for electronic transactions in the internal market and repealing Directive 1999/93/EC</small></td>
                                    <td><small>NAŘÍZENÍ EVROPSKÉHO PARLAMENTU A RADY (EU) č. 910/2014<br />ze dne 23. července 2014<br />o elektronické identifikaci a službách vytvářejících důvěru pro elektronické transakce na vnitřním trhu a o zrušení směrnice 1999/93/ES</small></td>
                                  </tr>
                                  <tr>
                                    <td><small>Article 25. 1) An electronic signature shall not be denied legal effect and admissibility as evidence in legal proceedings solely on the grounds that it is in an electronic form or that it does not meet the requirements for qualified electronic signatures.</small></td>
                                    <td><small>Článek 25. 1) Elektronickému podpisu nesmějí být upírány právní účinky a nesmí být odmítán jako důkaz v soudním a správním řízení pouze z toho důvodu, že má elektronickou podobu nebo že nesplňuje požadavky na kvalifikované elektronické podpisy.</small></td>
                                  </tr>
                                  <tr>
                                    <td><small>Article 46. An electronic document shall not be denied legal effect and admissibility as evidence in legal proceedings solely on the grounds that it is in electronic form.</small></td>
                                    <td><small>Článek 46. Elektronickému dokumentu nesmějí být upírány právní účinky a nesmí být odmítán jako důkaz v soudním a správním řízení pouze z toho důvodu, že má elektronickou podobu.</small></td>
                                  </tr>
                                </tbody>
                              </table>


                            </div>
                            <hr />
                            <div className="footer">
                              <p>____________________, _______________________ .</p>
                              <p className="text-right">________________________________<br />{this.state.firstname} {this.state.surname}</p>
                            </div>

                    </div>
                </div>


                    ) : '' }

                    

                { uploadFileReady === true && !verJsonHashIPFS ? (
                    <div>
                        <h2 className="display-4 text-center">Upload document</h2>
                        <div className="text-center">
                          <button className="btn btn-primary btn-lg csp" onClick={this.handleVerificationBttn}>&laquo; Back to form</button>
                          { verFileHashIPFS ? (
                            <button className="btn btn-primary btn-lg csp glyphicon glyphicon-search" onClick={this.submitData} >Verify on blockchain</button>
                            ) : (
                            <button className="btn btn-primary btn-lg csp glyphicon glyphicon-search" onClick={this.handleVerificationBttn} disabled>Verify on blockchain</button>) }
                          
                        </div>
                        <p>Be sure, that data in this form match with uploaded document.</p>


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
                              { verFileHashIPFS && <p><span className="text-success">Upload was successful</span><br /> {verFileHashIPFS}</p>}
                              { statusUpload !== 200 && statusUpload !== null && <p><span className="text-danger">Upload was not successful</span><br /> {errorUploadText}</p>}
                              { !fileAttached && <p><span className="text-muted">No file attached</span></p>}

                            </div>
                        </div>

                        <div className="form-row" >
                            <div className="form-group col-md-4">
                              <input type="text" className="form-control" placeholder="First name" name="firstname" id="firstname" defaultValue={this.state.firstname} disabled/>
                            </div>
                            <div className="form-group col-md-4">
                              <input type="text" className="form-control" placeholder="Last name" name="surname" id="surname" defaultValue={this.state.surname} disabled/>
                            </div>
                            <div className="form-group col-md-3">
                              <input type="date" className="form-control" placeholder="Birth Date" name="birthdate" id="birthdate" defaultValue={this.state.birthdate} disabled/>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group col-md-12">
                              <input type="text" className="form-control" placeholder="Address" name="addressHome" id="addressHome" defaultValue={this.state.addressHome} disabled/>
                            </div>
                          </div>


                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <input type="text" className="form-control" placeholder="City" name="city" id="city" defaultValue={this.state.city} disabled/>
                            </div>
                            <div className="form-group col-md-4">
                              <input type="text" className="form-control" placeholder="State" name="country" id="country" defaultValue={this.state.country} disabled/>
                            </div>
                            <div className="form-group col-md-2">
                              <input type="text" className="form-control" placeholder="ZIP" name="zip" id="zip" defaultValue={this.state.zip} disabled/>
                            </div>
                          </div>


                    </div>
                    ) : '' }

                  { verJsonHashIPFS && registrationSuccess === false ? (
                    <div>
                    <h2 className="display-4 text-center">Submit IPFS path to Blockchain</h2>
                    <p>Verification is ready, please control your data on any IPFS node. This is last step of verification, you are going to put final hash to Blockchain!</p>
                    <p><a href={IPFSgateway+verJsonHashIPFS} rel="noopener noreferrer" target="_blank">{verJsonHashIPFS}</a></p>
                    <p>Feel free to check any other IPFS gateway on <a href="https://ipfs.github.io/public-gateway-checker/" rel="noopener noreferrer" target="_blank">https://ipfs.github.io/public-gateway-checker/</a></p>
                    <div className="text-center"><button className="btn btn-primary btn-lg csp" onClick={this.submitIPFSHash}>Upload on Blockchain</button></div>
                    </div>): ''}



                  { registrationSuccess ? (
                    <div>
                    <h2 className="display-4 text-center">Registration was successfull</h2>
                    <p>Your data were broadcasted to blockchain and your identity is verified and stored in decentralized way. Cool! Transaction has to have at least 6 confirmations, however you can use Artbitrust now. </p>
                    <p><a href={IPFSgateway+verJsonHashIPFS} rel="noopener noreferrer" target="_blank">{verJsonHashIPFS}</a></p>
                    <p>txid: {txidRegistration}</p>
                    <p>Feel free to check any other IPFS gateway on <a href="https://ipfs.github.io/public-gateway-checker/" rel="noopener noreferrer" target="_blank">https://ipfs.github.io/public-gateway-checker/</a></p>
                    <p>Log out and log in in few minutes to upload your profile.</p>
                    </div>): ''}
              
            




            </div>

        );
    }
}


export default Register;
import React, { Component } from 'react';


class Footer extends Component {


  render() {
    return (
      <div>
	      <footer className="pt-4 my-md-5 pt-md-5 border-top no-print">
	        <div className="row">
	          <div className="col-12 col-md">
	            <small className="d-block mb-3 text-muted">Arbitrust © 2018</small>
	          </div>
	          <div className="col-6 col-md">
	            <h5>Resources</h5>
	            <ul className="list-unstyled text-small">
	              <li><span className="text-muted">Resource</span></li>
	            </ul>
	          </div>
	          <div className="col-6 col-md">
	            <h5>About</h5>
	            <ul className="list-unstyled text-small">
	              <li><span className="text-muted">Team</span></li>
	            </ul>
	          </div>
	        </div>
	      </footer>
      </div>
    );
  }
}


export default Footer;

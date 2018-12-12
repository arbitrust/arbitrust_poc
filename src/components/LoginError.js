import React, { Component } from 'react';


class LoginError extends Component {


  render() {
    return (
      <div class="alert alert-danger text-center" role="alert">
		  Login was unsuccessful. Contact support on info@arbitrust.org
	  </div>
    );
  }
}


export default LoginError;

import React from 'react'
import {Route, Redirect} from 'react-router-dom'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

// This is how to protect any route in React.  Instead of using the regular <Route /> tag in app.js you use <PrivateRoute /> and this component is what checks to make sure the user is authenicated and it isn't loading.

const PrivateRoute = ({component: Component, auth: {isAuthenticated, loading}, ...rest}) => (
    <Route 
        {...rest} 
        render={props => 
            !isAuthenticated && !loading ? 
            (<Redirect to='/login' />) : (<Component {...props} />)
        } 
    />
)

PrivateRoute.propTypes = {
    auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth
})

export default connect(mapStateToProps)(PrivateRoute);

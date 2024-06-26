import { Link } from "react-router-dom";
import { queryApi } from "../utils/queryApi"
import { useSelector } from 'react-redux';
import { chnageConenctedUser, selectConnectedUser, refreshUserToken } from '../Redux/slices/sessionSlice';
import { useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";
import Cookies from 'js-cookie'
import { useEffect, useState } from "react";
export default function Navbar({}) {
  
  const autoSignOut = async () => {
    const [res, err] = await queryApi('user/autoSignOut/' + connectedUser.id, null, 'GET', false, process.env.REACT_APP_SECRET);
    dispatch(chnageConenctedUser({ type: "disconnected" }))
    localStorage.removeItem('notif');
    history.push('/')
    
  }



  useEffect(() => {
    if (connectedUser.type != "disconnected" && !Cookies.get('connected')) {
      autoSignOut()
    }
  }, [])

  const history = useHistory()
  const dispatch = useDispatch();
  var connectedUser = useSelector(selectConnectedUser);
  return connectedUser.type == "disconnected" ? (
    <div id="header">
      <div className="container d-flex align-items-center">
        <h1 class="logo me-auto"><a href="index.html">Chat Platform</a></h1>
        <nav id="navbar" className="navbar order-last order-lg-0">
          <ul>
            <li><Link to={'/'}>Home</Link></li>
            <li><Link to={'/signin'}>Sign In</Link></li>
            <li><Link to={'/signup'}>Sign Up</Link></li>
          </ul>
          <i className="bi bi-list mobile-nav-toggle"></i>
        </nav>
      </div>
    </div>
  )  : connectedUser.type == "user" ? (
    <div id="header">
      <div className="container d-flex align-items-center">

        <h1 className="logo me-auto"><a href="index.html">Chat Platform</a></h1>
        <nav id="navbar" className="navbar order-last order-lg-0">
          <ul>
            <li><Link to={'/'}>Home</Link></li>
            <li><label style={{ display: "inline-flex" }}><Link to={'/SocialMedia'}>Community</Link>
            {JSON.parse(localStorage.getItem('notif')) && 
              <>{JSON.parse(localStorage.getItem('notif')).length> 0 && <>
                <label id="totalnotif" >   <span class="fa-stack has-badge" data-count='!'>
                  <i class="fa fa-circle fa-stack-2x"></i>
                  <i class="fa fa-bell fa-stack-1x fa-inverse"></i>
                </span></label></>}</>}</label></li>
            <li className="dropdown"><a>More</a>
              <ul>
                <li><Link to={'/profile'}>Profile</Link></li>
                <li><Link onClick={async () => {
                  const [res, err] = await queryApi('user/signout/' + connectedUser.id, null, "GET", false, connectedUser.token);                  
                  dispatch(chnageConenctedUser({ type: "disconnected" }))
                  Cookies.remove('connected')
                  localStorage.removeItem('notif');
                  history.push('/')
                 }}>Sign Out</Link></li>
              </ul>
            </li>
          </ul>
          <i className="bi bi-list mobile-nav-toggle"></i>
        </nav>
      </div>
    </div>
  ) : (
    <h1>problem happened</h1>
  )
}
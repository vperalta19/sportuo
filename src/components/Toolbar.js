import React, {useState} from 'react';
import {NavLink} from 'react-router-dom'
import '../assets/css/Toolbar.css'
import logo from '../assets/img/logo.png'
  

export default function NavBar() {
  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);
  
  return (
    <div className='header'>
     <div className={click ? "main-container" : ""}/>
      <nav className="navbar" onClick={(e)=>e.stopPropagation()}>
        <div className="nav-container">
          <NavLink exact to="/" className="nav-logo">
            <img src={logo} alt="logo"/>
          </NavLink>

          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item">
              <NavLink
                exact
                to="/"
                activeClassName="active"
                className="nav-links"
                onClick={click ? handleClick : null}
              >
                Inicio
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/socios"
                activeClassName="active"
                className="nav-links"
                onClick={click ? handleClick : null}
              >
                Socios
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/empleados"
                activeClassName="active"
                className="nav-links"
                onClick={click ? handleClick : null}
              >
                Empleados
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/servicios"
                activeClassName="active"
                className="nav-links"
               onClick={click ? handleClick : null}
              >
                Servicios
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/abonos"
                activeClassName="active"
                className="nav-links"
               onClick={click ? handleClick : null}
              >
                Abonos
              </NavLink>
            </li>
          </ul>
          <div className="nav-icon" onClick={handleClick}>
            <i className={click ? "fa fa-times" : "fa fa-bars"}></i>
          </div>
        </div>
      </nav>
    </ div>
  );
}
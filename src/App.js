import React from 'react';
import	{BrowserRouter as Router, Switch, Route} from 'react-router-dom';


import NavBar from './components/Toolbar';

import Inicio from './pages/Inicio';
import Socios from './pages/Socios';
import Empleados from './pages/Empleados';
import Servicios from './pages/Servicios';
import Abonos from './pages/Abonos';

export default class App extends React.Component {

	render(){
		return (
			   <Router>
					<NavBar />
		
					<div className="pages">
					<Switch>
						<Route exact path="/" component={Inicio} />
						<Route path="/socios" component={Socios} />
						<Route path="/empleados" component={Empleados} />
						<Route path="/servicios" component={Servicios} />
            <Route path="/abonos" component={Abonos} />
					</Switch>
					</div>
			  </Router>
		  );
	}
}


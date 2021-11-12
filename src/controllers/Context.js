import React from 'react';
import TurnosController from './TurnosController';
import UsuariosController from './UsuariosController';
import RecetasController from './RecetasController';
import NovedadesController from './NovedadesController';
import HistorialController from './HistorialController';

const globalState = {
	UsuariosController: new UsuariosController(),
	HistorialController: new HistorialController(),
	NovedadesController: new NovedadesController(),
	RecetasController: new RecetasController(),
	TurnosController: new TurnosController()
};

export const GlobalContext = React.createContext(globalState);
const GlobalContextProvider = (props) => {
	return (
		<GlobalContext.Provider value={globalState}>
			{props.children}
		</GlobalContext.Provider>
	);
};
export default GlobalContextProvider;

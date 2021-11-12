import { getHistoriales, crearHistorial, borrarHistorial, editarHistorial } from "../services/apiRoutes";

export default class NovedadesController{
    constructor(){
        this._historiales = []
    }

    async crearHistorial(novedad){
        var validacion = false;
        const response = await crearHistorial(novedad);
        if(response.status === 200) {
            validacion = true;
        }
        return validacion
    }

    async borrarHistorial(idHistorial){
        var validacion = false;
        const response = await borrarHistorial(idHistorial);
        if(response.status === 200) {
            validacion = true;
        }
        return validacion
    }

    async editarHistorial(info){
        var validacion = false;
        const response = await editarHistorial(info);
        if(response.status === 200) {
            validacion = true;
        }
        return validacion
    }

    async getHistoriales(dni){
        if (!!this._historiales){
            const response = await getHistoriales(dni);
            if(response.status === 200) {
                const json = await response.json()
                this._historiales = json;
                return json
            }
        }
        return this._historiales
    }

    
}
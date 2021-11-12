import React, { Component } from 'react';
import '../assets/css/Item.css'
import '../assets/css/Servicio.css'
import Item from "./Item";
import Modal from '../components/Modal'
import { endpointCall } from '../services/apiRoutes';
import InputsItemContent from './InputsItemContent';

export default class Servicio extends Component {

	constructor(props){
		super(props);
		this.servicio = props.servicio;
		this.buttons = [
			{
				name: 'Modificar',
				action: 'modificacion',
				function: ()=>{this.setModalModificacion()}
			},
			{
				name: 'Dar de baja',
				action: 'baja',
				function: ()=>{this.setModalBaja()}
			}
		]
		this.state = {
			modalIsOpen: false,
			modalContent: <div></div>,
			modalTitle: '',
			modifyServicio: Object.assign({}, {
				nombre: props.servicio.name,
				profesor: props.servicio.trainnerID,
				descripcion: props.servicio.description,
				horarios: props.servicio.schedule
			}),
			onAccept: ()=>{return;},
			onCancel: ()=>{this.onCancel()},
		}
		//estos dos ultimos tendrian que darse funcionalidad en los setModal
		this.modalForm = React.createRef();
	}

	async setModalModificacion() {
		this.setState({
			modalIsOpen: true,
			modalTitle: 'Modificar',
			modalContent: await this.getModalModificacionContent(),
			onAccept: ()=>{this.onAcceptModify()}
		})
	}

	handleChange = (name, value) => {
		const modifyServicio = this.state.modifyServicio;
		modifyServicio[name] = value;
		this.setState({
			modifyServicio: modifyServicio
		});
		this.modalForm.current.updateValues(modifyServicio);
    }

	async getModalModificacionContent(){
		const empleadorResponse = await endpointCall("user/trainners");
		const empleados  = await (await empleadorResponse.json()).data;

		return <InputsItemContent 
					ref={this.modalForm}
					indications='Cargar los siguientes datos para editar el servicio'
					properties={[
						{
							propertyId: 'nombre',
							propertyName: 'Nombre',
							nonEmpty: true,
							errorMsg: "Utilice un nombre valido."
						},
						{
							propertyId: 'profesor',
							propertyName: 'Profesor',
							nonEmpty: true,
							errorMsg: "Seleccione un profesor",
							select: true,
							list: empleados.map( e => {
								return {
									value: e.id,
									label: (e.name + ' ' + e.surname)
								};
							})
						},
						{
							propertyId: 'descripcion',
							propertyName: 'Descripción'
						},
						{
							propertyId: 'horarios',
							propertyName: 'Disponibilidad',
							nonEmpty: true,
							errorMsg: "Especifique cuando estará disponible este servicio."
						}
					]}
					handleChange={(name, value)=>{this.handleChange(name, value)}}
					values={this.state.modifyServicio}
				>
				</InputsItemContent>
	}

	setModalAlta() {
		this.setState({
			modalIsOpen: true,
			modalTitle: 'Adherir',
			modalContent: <div>Adherir Content</div>,
		})
	}

	setModalBaja() {
		this.setState({
			modalIsOpen: true,
			modalTitle: 'Dar de baja',
			modalContent: <div>Seguro que quieres eliminar el servicio: {this.servicio.name}</div>,
			onAccept: ()=>{this.deleteServicio()},
			onCancel: ()=>{this.onCancel()},
		})
	}

	async deleteServicio(){
		const response = await  endpointCall("appointment", {id: this.servicio.id},'DELETE');
		if((await response).ok){
			this.setState({
				modalIsOpen: false
			})
			this.props.fetchData()
		}
	}

	async onAcceptModify() {
		if (this.modalForm.current.checkForm())
		{
			const response = await endpointCall("appointment", {
				id: this.servicio.id,
				name: this.state.modifyServicio.nombre,
				trainnerID: this.state.modifyServicio.profesor,
				description: this.state.modifyServicio.descripcion,
				schedule: this.state.modifyServicio.horarios 
			},'PATCH');
			if ((await response).ok) {
				this.setState({
					modalIsOpen: false
				})
				setTimeout(() => {this.props.fetchData()}, 100)
			}
		}
	}

	onCancel() {
		this.setState({
			modifyServicio: Object.assign({}, this.servicio),
			modalIsOpen: false
		})
	}

	getContent()
	{
		return (
			<div className='info-container'>
				<div className='info small'>
					<div className='property'>
						<div className='property-title'>Descripción:</div>
						<div className='property-value'>{this.servicio.description}</div>
					</div>
					<div className='property'>
						<div className='property-title'>Disponibilidad: </div>
						<div className='property-value'>{this.servicio.schedule}</div>
					</div>
					<div className='property'>
						<div className='property-title'>Profesor:</div>
						<div className='property-value'>{this.servicio.trainnerName + ' ' + this.servicio.trainnerSurname}</div>
					</div>
				</div>
			</div>
		);
	}

	// getFechasList(fechas)
	// {
	// 	var fechasObj = { }
	// 	fechas.forEach(fecha => {
	// 		const date = this.getDateString(fecha);
	// 		const time = this.getTimeString(fecha);
	// 		var timesArray = fechasObj[date];

	// 		if (timesArray == null)
	// 		{
	// 			timesArray = [time];
	// 		}
	// 		else
	// 		{
	// 			timesArray.push(time);
	// 		}
	// 		fechasObj[date] = timesArray;
	// 	});

	// 	return Object.keys(fechasObj).map(
	// 		(fecha,keyFechasObj) => {
	// 			return (
	// 						<div className='date-container' key={keyFechasObj}>
	// 							<div className='date'>{fecha}</div>
	// 							{
	// 								fechasObj[fecha].map(
	// 									(time,keyFecha) => {
	// 										return (
	// 											<div className='time' key={keyFecha}>{time}</div>
	// 										);
	// 									}
	// 								)
	// 							}
	// 						</div>
	// 					);
	// 		}
	// 	);
	// }

	getDateString(date)
	{
		return date.getDate() + "/" + date.getMonth();
	}

	getTimeString(date)
	{
		return date.getHours();
	}

	render()
	{
		return (
			<div className='item-container'>
				<Modal 
					content={this.state.modalContent} 
					isOpen={this.state.modalIsOpen}
					title={this.state.modalTitle}
					onAccept={()=>{this.state.onAccept()}}
					onCancel={()=>{this.state.onCancel()}}
					cancel={true}
				></Modal>
				<Item content={this.getContent()} buttons={this.buttons} title={this.servicio.name} openModal={() =>this.setState({isOpen: true})}/>
			</div>
		);
	}
}
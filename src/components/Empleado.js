import React, { Component } from 'react';
import Item from "./Item";
import Modal from '../components/Modal'
import { endpointCall } from '../services/apiRoutes';
import InputsItemContent from './InputsItemContent';

export default class Empleado extends Component {

	constructor(props){
		super(props);
		this.empleado = props.empleado;
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
			modifyEmpleado: Object.assign({}, props.empleado),
			onAccept: ()=>{return;},
			onCancel: ()=>{this.onCancel()},
		}
		//estos dos ultimos tendrian que darse funcionalidad en los setModal
		this.modalForm = React.createRef();
	}

	handleChange = (name, value) => {
		const modifyEmpleado = this.state.modifyEmpleado;
		modifyEmpleado[name] = value;
		this.setState({
			modifyEmpleado: modifyEmpleado
		});
		this.modalForm.current.updateValues(modifyEmpleado);
    }

	setModalModificacion() {
		this.setState({
			modalIsOpen: true,
			modalTitle: 'Modificar',
			modalContent: this.getModalModificacionContent(),
			onAccept: ()=>{this.onAcceptModify()}
		})
	}

	getModalModificacionContent() {
		return 	<InputsItemContent 
					ref={this.modalForm}
					indications='Cargar los siguientes datos para editar al empleado'
					properties={[
						{
							propertyId: 'name',
							propertyName: 'Nombre',
							nonEmpty: true,
							errorMsg: "Ingrese un nombre"
						},
						{
							propertyId: 'surname',
							propertyName: 'Apellido',
							nonEmpty: true,
							errorMsg: "Ingrese un apellido"
						},
						{
							propertyId: 'phone',
							propertyName: 'Número de teléfono',
							nonEmpty: true,
							errorMsg: "Ingrese un numero de telefono"
						},
						{
							propertyId: 'email',
							propertyName: 'Mail',
							nonEmpty: true,
							errorMsg: "Ingrese un email"
						},
						{
							propertyId: 'address',
							propertyName: 'Dirección',
							nonEmpty: true,
							errorMsg: "Ingrese una dirección"
						}
					]}
					handleChange={(name, value)=>{this.handleChange(name, value)}}
					values={this.state.modifyEmpleado}
				>
				</InputsItemContent>
	}

	async liquidarSueldo() {
		let date = new Date()
		const response = await  endpointCall("finance/pay-salary", {id: this.empleado.id, fechaInicio: new Date(date.getFullYear(), date.getMonth(), 1)},'POST');
		this.setState({
			modalIsOpen: true,
			modalTitle: 'Liquidación de Sueldo',
			modalContent: <div>{(await response).ok ? "El sueldo se ha liquidado exitosamente." :  "La liquidación ha fallado."}</div>,
			onAccept: ()=>{this.onCancel()},
			onCancel: ()=>{this.onCancel()},
		})
	}

	setModalBaja() {
		this.setState({
			modalIsOpen: true,
			modalTitle: 'Dar de baja',
			modalContent: <div>Seguro que quieres eliminar al empleado: {this.empleado.name + ' ' + this.empleado.surname}?</div>,
			onAccept: ()=>{this.deleteEmpleado()},
			onCancel: ()=>{this.onCancel()},
		})
	}


	async deleteEmpleado(){
		const response = await  endpointCall("user/employee", {id: this.empleado.id},'DELETE');
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
			const response = await endpointCall("user/employee", this.state.modifyEmpleado,'PATCH');
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
			modifyEmpleado: Object.assign({}, this.empleado),
			modalIsOpen: false
		})
	}

	getContent()
	{
		return (

			<div className='item-content-container'>
				<div className='info small'>
					<div className='property'>
						<div className='property-title'>DNI:</div>
						<div className='property-value'>{this.empleado.dni}</div>
					</div>
					<div className='property'>
						<div className='property-title'>Telefono:</div>
						<div className='property-value'>{this.empleado.phone}</div>
					</div>
					<div className='property'>
						<div className='property-title'>Mail:</div>
						<div className='property-value'>{this.empleado.email}</div>
					</div>
				</div>
				<div className='info small'>
					<div className='property'>
						<div className='property-title'>Fecha de nacimiento:</div>
						<div className='property-value'>{this.empleado.birthday}</div>
					</div>
					<div className='property'>
						<div className='property-title'>Salario por hora:</div>
						<div className='property-value'>{this.empleado.salaryPerHour}</div>
					</div>
					<div className='property'>
						<div className='property-title'>Dirección:</div>
						<div className='property-value'>{this.empleado.address}</div>
					</div>
				</div>
				<div className='info small'>
					<div className='property'>
						<div className='property-title'>Horas trabajadas:</div>
						<div className='property-value'>{this.empleado.hoursWorked}</div>
					</div>
				</div>
			</div>
		);
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
				<Item content={this.getContent()} buttons={this.buttons} title={this.empleado.name + ' ' + this.empleado.surname} openModal={() =>this.setState({isOpen: true})}/>
			</div>
		);
	}
}
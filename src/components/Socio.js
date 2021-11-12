import React, { Component } from 'react';
import Item from "./Item";
import Modal from '../components/Modal'
import { endpointCall } from '../services/apiRoutes';
import InputsItemContent from './InputsItemContent';

export default class Socio extends Component {

	constructor(props){
		super(props);
		this.socio = props.socio;
		this.buttons = [
            {
                name: 'Modificar',
                action: 'modificacion',
                function: ()=>{this.setModalModificacion()}
            },
            {
                name: 'Adherir',
                action: 'alta',
                function: ()=>{this.setModalAlta()}
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
			modifySocio: Object.assign({}, props.socio),
			adherirSocio: Object.assign({}, props.socio),
			onAccept: ()=>{return},
			onCancel: ()=>{this.onCancel()},
			adherirOption: 'abono'
		}
		//estos dos ultimos tendrian que darse funcionalidad en los setModal
		this.modalForm = React.createRef();
	}

	handleChangeModify = (name, value) => {
		const modifySocio = this.state.modifySocio;
		modifySocio[name] = value;
		this.setState({
			modifySocio: modifySocio
		});
		this.modalForm.current.updateValues(modifySocio);
    }

	handleChange = (name, value) => {
        const adherirSocio = this.state.adherirSocio;
		adherirSocio[name] = value;
		this.setState({
			adherirSocio: adherirSocio
		});
		this.modalForm.current.updateValues(adherirSocio);
    }

	setModalModificacion() {
		this.setState({
			modalIsOpen: true,
			modalTitle: 'Modificar',
			modalContent: this.getModalModificacionContent(),
			onAccept: ()=>{this.onAcceptModify()}
		})
	}

	getModalModificacionContent(){
		return 	<InputsItemContent
					ref={this.modalForm}
					indications='Cargar los siguientes datos para modificar al socio'
					properties={[
						{
							propertyId: 'medicalDischarge',
							propertyName: 'Alta Medica',
							nonEmpty: true,
							select: true,
							list:	[{
										value: false,
										label: "No"
									},
									{
										value: true,
										label: "Si"
									}],
							errorMsg: "Es necesario seleccionar un opción"
						},
						{
							propertyId: 'data',
							propertyName: 'Información Medica',
						},
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
							propertyName: 'Dirección'
						}
					]}
					handleChange={(name, value)=>{this.handleChangeModify(name, value)}}
					values={this.state.modifySocio}
				>
				</InputsItemContent>
	}

	async onAcceptAlta(){
		if (this.modalForm.current.checkForm())
		{
			let response;
			if(this.state.adherirOption === 'abono'){
				response = await endpointCall("finance/set-subscription", {
					dni: this.socio.dni,
					subscriptionID: this.state.adherirSocio.subscriptionID,
					tipo: '0 o 1',
					numeroTarjeta: this.state.adherirSocio.numeroTarjeta,
					codSeg: this.state.adherirSocio.codSeg,
					fechaVencimiento: this.state.adherirSocio.fechaVencimiento,
				}, 'POST');
			}
			else if(this.state.adherirOption === 'servicio'){
				response = await endpointCall("appointment/set", {
					claseID: this.state.adherirSocio.claseID,
					userID: this.socio.id,
				}, 'POST');
			}
			if ((await response).ok) {
				this.setState({
					modalIsOpen: false
				})
				setTimeout(() => {this.props.fetchData()}, 100)
			}
			
		}
	}

	async setModalAlta() {
		const responseA = await endpointCall("finance/get-subscriptions");
        this.abonos  = await (await responseA.json()).data;
		const responseS = await endpointCall("appointment");
        this.servicios  = await (await responseS.json()).data;
		this.setState({
			modalIsOpen: true,
			modalTitle: 'Adherir',
			modalContent: await this.getModalAltaContent(),
			onAccept: ()=>{this.onAcceptAlta()}
		})
	}

	async changeAdherirSocioContainer(content){
		await this.setState({
			adherirOption: content,
		})
		this.setState({
			modalContent: await this.getModalAltaContent(),
		})
	}

	async getModalAltaContent(){
		return 	<div>
					<div className='adherir-socio-container'>
						<div className={(this.state.adherirOption === 'abono') ? 'adherir-socio selected' : 'adherir-socio'} 
							onClick={()=>{this.changeAdherirSocioContainer('abono')}}>Adherir a abono</div>
						<div className={(this.state.adherirOption === 'servicio') ? 'adherir-socio selected' : 'adherir-socio'} 
							onClick={()=>{this.changeAdherirSocioContainer('servicio')}}>Adherir a servicio</div>
					</div>
					{(this.state.adherirOption === 'abono') ? 
					<InputsItemContent
						ref={this.modalForm}
						indications='Seleccionar tipo de abono y metodo en el que se pago'
						properties={[
							{
								propertyId: 'subscriptionID',
								propertyName: 'Tipo',
								nonEmpty: true,
								errorMsg: "Seleccione un abono",
								select: true,
								list: await this.abonos.map((a)=>{
									return {
										value: a.id,
										label: a.type
									}
								})
							},
							{
								propertyId: 'metodoPago',
								propertyName: 'Metodo Pago',
								nonEmpty: true,
								errorMsg: "Seleccione un metodo de pago",
								select: true,
								list: [
									{
										value: 0,
										label: 'Efectivo'
									},
									{
										value: 1,
										label: 'Tarjeta'
									}
								]
							},
						]}
						handleChange={(name, value)=>{this.handleChange(name, value)}}
						values={this.state.adherirSocio}
					>
					</InputsItemContent>
					:
					<InputsItemContent
						ref={this.modalForm}
						indications='Seleccionar el servicio al que se quiere adherir'
						properties={[
							{
								propertyId: 'claseID',
								propertyName: 'Servicio',
								nonEmpty: true,
								errorMsg: "Seleccione un servicio",
								select: true,
								list: await this.servicios.map((s)=>{
									return {
										value: s.id,
										label: s.name
									}
								})
							},
						]}
						handleChange={(name, value)=>{this.handleChange(name, value)}}
						values={this.state.adherirSocio}
					>
					</InputsItemContent>}
				</div>
	}


	setModalBaja() {
		this.setState({
			modalIsOpen: true,
			modalTitle: 'Dar de baja',
			modalContent: <div>Seguro que quieres eliminar al socio: {this.socio.name + ' ' + this.socio.surname}?</div>,
			onAccept: ()=>{this.deleteSocio()},
			onCancel: ()=>{this.onCancel()},
		})
	}

	async deleteSocio(){
		const response = await  endpointCall("user", {id: this.socio.id},'DELETE');
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
			const responseA = await endpointCall("user", this.state.modifySocio,'PATCH');
			const responseB = await endpointCall("user/set-health-record", {
				userID: this.state.modifySocio.id,
				medicalDischarge: this.state.modifySocio.medicalDischarge,
				data: this.state.modifySocio.data
			},'POST');
			if ((await responseA).ok && (await responseB).ok) {
				this.setState({
					modalIsOpen: false
				})
				setTimeout(() => {this.props.fetchData()}, 100)
			}
		}
	}

	onCancel() {
		this.setState({
			modifyEmpleado: Object.assign({}, this.socio),
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
						<div className='property-value'>{this.socio.dni}</div>
					</div>
					<div className='property'>
						<div className='property-title'>Telefono:</div>
						<div className='property-value'>{this.socio.phone}</div>
					</div>
					<div className='property'>
						<div className='property-title'>Mail:</div>
						<div className='property-value'>{this.socio.email}</div>
					</div>
				</div>
				<div className='info small'>
					<div className='property'>
						<div className='property-title'>Apto medico:</div>
						<div className='property-value'>{this.socio.medicalDischarge == 1 ? "Si" : "No" }</div>
					</div>
					<div className='property'>
						<div className='property-title'>Dirección:</div>
						<div className='property-value'>{this.socio.address}</div>
					</div>
					<div className='property'>
						<div className='property-title'>Suscripción:</div>
						<div className='property-value'>{this.socio.subscriptionType}</div>
					</div>
				</div>
				<div className='info big'>
					<div className='property'>
						<div className='property-title'>Descripción Médica:</div>
						<div className='property-value'>{this.socio.data}</div>
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
				<Item content={this.getContent()} buttons={this.buttons} title={this.socio.name + ' ' + this.socio.surname} openModal={() =>this.setState({isOpen: true})}/>
			</div>
		);
	}
}
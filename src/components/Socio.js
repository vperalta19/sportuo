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
			adherirOption: 'abono',
			errorInputs: false,
			errorInputText: '',
			cancel: true
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
			onAccept: ()=>{this.onAcceptModify()},
			cancel: true,
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
							errorMsg: "Es necesario seleccionar un opci??n"
						},
						{
							propertyId: 'data',
							propertyName: 'Informaci??n Medica',
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
							propertyName: 'N??mero de tel??fono',
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
							propertyName: 'Direcci??n'
						}
					]}
					handleChange={(name, value)=>{this.handleChangeModify(name, value)}}
					values={this.state.modifySocio}
				>
				</InputsItemContent>
	}
	
	getModalFactura(response){
		return (<div>
					<div>Monto: ${response.monto} </div> 
					<div>Suscripci??n: Abono {response.abono} </div>
					{(this.state.adherirSocio.tipo === 0) ? 
					<div>Metodo de pago: Efectivo</div> 
					: 
					<div>
						<div>Metodo de pago: Tarjeta</div> 
						<div>Tarjeta finalizada en: {this.state.adherirSocio.numeroTarjeta.substr(this.state.adherirSocio.numeroTarjeta.length - 4)}</div> 
					</div> 
					}
				</div>)
	}

	async onAcceptAlta(){
		if (this.modalForm.current.checkForm())
		{
			let response;
			if(this.state.adherirOption === 'abono'){
				if(this.state.adherirSocio.tipo === 1){
					response = await endpointCall("finance/set-subscription", {
						dni: this.socio.dni,
						subscriptionID: this.state.adherirSocio.subscriptionID,
						tipo: this.state.adherirSocio.tipo,
						numeroTarjeta: this.state.adherirSocio.numeroTarjeta,
						codSeg: this.state.adherirSocio.codSeg,
						fechaVencimiento: this.state.adherirSocio.fechaVencimiento,
					}, 'POST');
				}
				else{
					response = await endpointCall("finance/set-subscription", {
						dni: this.socio.dni,
						subscriptionID: this.state.adherirSocio.subscriptionID,
						tipo: this.state.adherirSocio.tipo
					}, 'POST');
				}
				
			}
			else if(this.state.adherirOption === 'servicio'){
				response = await endpointCall("appointment/set", {
					claseID: this.state.adherirSocio.claseID,
					userID: this.socio.id,
				}, 'POST');
			}
			if ((await response).ok) {
				if(this.state.adherirOption === 'abono'){
					this.setState({
						modalContent: this.getModalFactura(await response.json()),
						modalTitle: 'Factura',
						onAccept: ()=>{this.props.fetchData();this.onCancel();},
						cancel: false
					})
				}
				else{
					this.setState({
						modalIsOpen: false
					})
				}
			}
			else{
				const json = await response.json();
				this.setState({
					errorInputs: true,
					errorInputText: json.message
				})
				this.reloadInputs()
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
			onAccept: ()=>{this.onAcceptAlta()},
			cancel: true,
		})
	}

	async changeAdherirSocioContainer(content){
		await this.setState({
			adherirOption: content,
		})
		this.reloadInputs()
	}

	async reloadInputs(){
		this.setState({
			modalContent: await this.getModalAltaContent(),
		})
	}

	

	async getModalAltaContent(){
		return 	<div className='adherir-socio-modal'>
					<div className='adherir-socio-container'>
						<div className={(this.state.adherirOption === 'abono') ? 'adherir-socio selected' : 'adherir-socio'} 
							onClick={()=>{this.changeAdherirSocioContainer('abono')}}>Adherir a abono</div>
						<div className={(this.state.adherirOption === 'servicio') ? 'adherir-socio selected' : 'adherir-socio'} 
							onClick={()=>{this.changeAdherirSocioContainer('servicio')}}>Adherir a servicio</div>
					</div>
					{(this.state.adherirOption === 'abono') ? 
					(this.state.adherirSocio.tipo === 1) ?
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
								propertyId: 'tipo',
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
							{
								propertyId: 'numeroTarjeta',
								propertyName: 'Numero de Tarjeta',
								nonEmpty: true,
								errorMsg: "Ingrese el numero de Tarjeta"
							},
							{
								propertyId: 'codSeg',
								propertyName: 'Codigo de seguridad',
								nonEmpty: true,
								errorMsg: "Ingrese el codigo de seguridad"
							},
							{
								propertyId: 'fechaVencimiento',
								propertyName: 'Fecha de vencimiento (Ej: 2023-04)',
								nonEmpty: true,
								errorMsg: "Ingrese la fehca de vencimiento"
							},

						]}
						handleChange={(name, value)=>{this.handleChange(name, value);this.reloadInputs()}}
						values={this.state.adherirSocio}
					>
					</InputsItemContent>
					:
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
								propertyId: 'tipo',
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
						handleChange={(name, value)=>{this.handleChange(name, value);this.reloadInputs()}}
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
					{(this.state.errorInputs) ? <div style={{color:"red"}}>{this.state.errorInputText}</div> : ''}
				</div>
	}


	setModalBaja() {
		this.setState({
			modalIsOpen: true,
			modalTitle: 'Dar de baja',
			modalContent: <div>Seguro que quieres eliminar al socio: {this.socio.name + ' ' + this.socio.surname}?</div>,
			onAccept: ()=>{this.deleteSocio()},
			cancel: true,
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
						<div className='property-value'>{this.socio.medicalDischarge === 1 ? "Si" : "No" }</div>
					</div>
					<div className='property'>
						<div className='property-title'>Direcci??n:</div>
						<div className='property-value'>{this.socio.address}</div>
					</div>
					<div className='property'>
						<div className='property-title'>Suscripci??n:</div>
						<div className='property-value'>{this.socio.subscriptionType}</div>
					</div>
				</div>
				<div className='info big'>
					<div className='property'>
						<div className='property-title'>Descripci??n M??dica:</div>
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
					cancel={this.state.cancel}
				></Modal>
				<Item content={this.getContent()} buttons={this.buttons} title={this.socio.name + ' ' + this.socio.surname} openModal={() =>this.setState({isOpen: true})}/>
			</div>
		);
	}
}
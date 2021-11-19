import React, { Component } from 'react'
import Socio from '../components/Socio';
import PageContainer from '../components/PageContainer';
import Modal from '../components/Modal';
import NotFound from '../components/NotFound';
import InputsItemContent from '../components/InputsItemContent';
import { endpointCall } from '../services/apiRoutes';
import {CircularProgress} from '@mui/material';


export default class Socios extends Component {
	constructor(){
		super();
		this.state = {
			items: [],
			itemsBackup: [],
			modalIsOpen: false,
			modalTitle: 'Agregar nuevo socio',
			modalContent: '',
			values: {
				type: 0
			},
			modalState: 'signUp',
			adherirSocio:{},
			loading: false,
			errorInputs: false,
			errorInputsText: '',
			onAccept: ()=>this.onAccept()
		}
		this.modalForm = React.createRef()
	}

	handleChange = (name, value) => {
		const values = this.state.values;
		values[name] = value;
		this.setState({
			values: values
		});
		this.modalForm.current.updateValues(values);
    }

	handleChangeAdherir = (name, value) => {
        const adherirSocio = this.state.adherirSocio;
		adherirSocio[name] = value;
		this.setState({
			adherirSocio: adherirSocio
		});
		this.modalForm.current.updateValues(adherirSocio);
    }

	async reloadInputs(){
		this.setState({
			modalContent: await this.getCreateItemModalContent(),
			onAccept: ()=>this.onAccept()
		})
	}


	async getCreateItemModalContent(){
		const response = await endpointCall("finance/get-subscriptions");
        const abonos  = await (await response.json()).data;
		return (<div>{(this.state.modalState === 'signUp') ? <InputsItemContent
					ref={this.modalForm}
					indications='Cargar los siguientes datos para crear un nuevo socio'
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
							propertyId: 'dni',
							propertyName: 'Dni',
							propertyType: 'number',
							nonEmpty: true,
							errorMsg: "Ingrese un dni"
						},
						{
							propertyId: 'birthday',
							propertyName: 'Fecha de nacimiento',
							date: true,
							nonEmpty: true,
							errorMsg: "Ingrese una fecha de nacimiento"
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
						},
						
					]}
                    handleChange={(name, value)=>{this.handleChange(name, value)}}
					values={this.state.values}
				>
				</InputsItemContent>
				:
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
								list: await abonos.map((a)=>{
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
						handleChange={(name, value)=>{this.handleChangeAdherir(name, value);this.reloadInputs()}}
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
								list: await abonos.map((a)=>{
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
						handleChange={(name, value)=>{this.handleChangeAdherir(name, value);this.reloadInputs()}}
						values={this.state.adherirSocio}
					>
					</InputsItemContent>}
					{(this.state.errorInputs) ? <div style={{color:"red"}}>{this.state.errorInputText}</div> : ''}
					</div>
				)
	}
	

	componentDidMount(){
		this.fetchData()
	}

	async fetchData(){
		this.setState({
			loading: true,
			items: []
		})
		const response = await endpointCall("user/get-users");
		const socios  = await (await response.json()).data;
		this.setState({
			items: socios,
			itemsBackup: socios,
			modalContent: await this.getCreateItemModalContent(),
			onAccept: ()=>this.onAccept(),
			loading: false
		})
		

	}

	onAltaSectionClick(){
		this.reloadInputs()
		this.setState({
			modalIsOpen: true
		})
	}

	getModalFactura(response){
		return (<div>
					<div>Monto: ${response.monto} </div> 
					<div>Suscripción: Abono {response.abono} </div>
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

	async onAccept(){
		if (this.modalForm.current.checkForm())
		{
			let response;
			if(this.state.modalState === 'signUp'){

				response = await endpointCall("user/sign-up", this.state.values,'POST');
				const json  = await response.json();
				const socioResponse  = json.data;
				if ((await response).ok) {
					await endpointCall("user/set-health-record", {
						userID: socioResponse.id,
						medicalDischarge: false,
						data: "-"
					},'POST');
					this.dniNewSocio = this.state.values.dni
					this.setState({
						modalState: 'abono',
						errorInputs: false,
					})
					this.fetchData()
				}
				else{
					this.setState({
						errorInputs: true,
						errorInputText: json.message
					})
					this.reloadInputs()
				}
			}
			else if(this.state.modalState === 'abono'){
				if(this.state.adherirSocio.tipo === 1){
					response = await endpointCall("finance/set-subscription", {
						dni: this.state.values.dni,
						subscriptionID: this.state.adherirSocio.subscriptionID,
						tipo: this.state.adherirSocio.tipo,
						numeroTarjeta: this.state.adherirSocio.numeroTarjeta,
						codSeg: this.state.adherirSocio.codSeg,
						fechaVencimiento: this.state.adherirSocio.fechaVencimiento,
					}, 'POST');
				}
				else{
					response = await endpointCall("finance/set-subscription", {
						dni: this.state.values.dni,
						subscriptionID: this.state.adherirSocio.subscriptionID,
						tipo: this.state.adherirSocio.tipo,
					}, 'POST');
				}
				if ((await response).ok) {
					this.setState({
						modalContent: this.getModalFactura(await response.json()),
						modalTitle: 'Factura',
						onAccept: ()=>{this.fetchData();this.onCancel();},
						cancel: false
					})
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
	}

	onCancel(){
		this.setState({
			modalIsOpen: false
		})
	}

	async onSearchChange(searchValue){
		await this.setState({
			items: []
		})
		const listToFilter = Array.from(this.state.itemsBackup);
		const listFiltered = listToFilter.filter((element) => element.name.toUpperCase().includes(searchValue.toUpperCase()) || element.surname.toUpperCase().includes(searchValue.toUpperCase()));
		this.setState({
			items: listFiltered
		})
	}

	render() {
		return (
			<div style={{width:'100%'}}>
				<Modal 
					content={this.state.modalContent} 
					isOpen={this.state.modalIsOpen}
					title={this.state.modalTitle}
					onAccept={()=>{this.state.onAccept()}}
					onCancel={()=>{this.onCancel()}}
					cancel={this.state.modalState !== 'abono'}
				></Modal>
				<PageContainer 
					content={
								(this.state.items.length > 0) ? 
								this.state.items.map((item,key)=>{
									return <Socio socio={item} key={key} fetchData={()=>{this.fetchData()}}/>
								}) :
								(this.state.loading) ?
								<CircularProgress color="success"/> :
								<NotFound></NotFound>
							}
					altaSectionName='AGREGAR NUEVO SOCIO'
					onAltaSectionClick={()=>{this.onAltaSectionClick()}}
					onSearchChange={(searchValue)=>{this.onSearchChange(searchValue)}}
				>
				</PageContainer>
			</div>
		)
	}
}

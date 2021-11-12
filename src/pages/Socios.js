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

	async getCreateItemModalContent(){
		const response = await endpointCall("finance/get-subscriptions");
        const abonos  = await (await response.json()).data;
		return ((this.state.modalState === 'signUp') ? <InputsItemContent
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
					handleChange={(name, value)=>{this.handleChangeAdherir(name, value)}}
					values={this.state.adherirSocio}
				>
				</InputsItemContent>
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
			loading: false
		})

	}

	onAltaSectionClick(){
		this.setState({
			modalIsOpen: true
		})
	}

	async onAccept(){
		if (this.modalForm.current.checkForm())
		{
			let response;
			if(this.state.modalState === 'signUp'){

				response = await endpointCall("user/sign-up", this.state.values,'POST');
				const socioResponse  = await (await response.json()).data;
				if ((await response).ok) {
					await endpointCall("user/set-health-record", {
						userID: socioResponse.id,
						medicalDischarge: false,
						data: "-"
					},'POST');
					this.dniNewSocio = this.state.values.dni
					this.setState({
						modalState: 'abono'
					})
					this.fetchData()
				}
			}
			else if(this.state.modalState === 'abono'){
				response = await endpointCall("finance/set-subscription", {
					dni: this.dniNewSocio,
					subscriptionID: this.state.adherirSocio.subscriptionID,
					metodoPago: this.state.adherirSocio.metodoPago
				}, 'POST');
				this.setState({
					modalState: 'signUp',
					modalIsOpen: false
				})
				this.fetchData()
			}
			
		}
	}

	onCancel(){
		this.setState({
			modalIsOpen: false
		})
	}

	onSearchChange(searchValue){
		
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
					onAccept={()=>{this.onAccept()}}
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

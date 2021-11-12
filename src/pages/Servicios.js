import React, { Component } from 'react'
import Servicio from '../components/Servicio';
import PageContainer from '../components/PageContainer';
import Modal from '../components/Modal';
import NotFound from '../components/NotFound';
import InputsItemContent from '../components/InputsItemContent';
import { endpointCall } from '../services/apiRoutes';
import {CircularProgress} from '@mui/material';


export default class Servicios extends Component {
	constructor(){
		super();

		this.state = {
			items: [],
			itemsBackUp: [],
			modalIsOpen: false,
			modalTitle: 'Agregar nuevo servicio',
			modalContent: '',
			values: {},
			loading: false
		}
		this.modalForm = React.createRef();
	}

	handleChange = (name, value) => {
		const values = this.state.values;
		values[name] = value;
		this.setState({
			values: values
		});
		this.modalForm.current.updateValues(values);
    }

	async getCreateItemModalContent(){
		const empleadorResponse = await endpointCall("user/trainners");
		const empleados  = await (await empleadorResponse.json()).data;

		return <InputsItemContent 
					ref={this.modalForm}
					indications='Cargar los siguientes datos para crear un nuevo servicio'
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
					values={this.state.values}
				>
				</InputsItemContent>
	}
	
	componentDidMount(){
		this.fetchData()
    }

	async fetchData(){
		this.setState({
			loading: true,
			items: []
        })
		const response = await endpointCall("appointment");
        const servicios  = await (await response.json()).data;
        this.setState({
			items: servicios,
			itemsBackup: servicios,
            modalContent: await this.getCreateItemModalContent(),
			loading: false
        })
	}

	onAltaSectionClick() {
		this.setState({
			modalIsOpen: true
		})
	}

	async onAccept(){
		if (this.modalForm.current.checkForm())
		{
			const response = await endpointCall("appointment/new", this.state.values,'POST');
			if ((await response).ok) {
				this.setState({
					modalIsOpen: false
				})
				this.fetchData()
			}
		}
	}

	onCancel() {
		this.setState({
			modalIsOpen: false
		})
	}

	onSearchChange(searchValue){
		
		const listToFilter = Array.from(this.state.itemsBackUp);
		const listFiltered = listToFilter.filter((element) => element.name.toUpperCase().includes(searchValue.toUpperCase()));
		
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
					cancel={true}
				></Modal>
				<PageContainer 
					content={
								(this.state.items.length > 0) ? 
								this.state.items.map((item,key)=>{
									return <Servicio servicio={item} key={key} fetchData={()=>{this.fetchData()}}/>
								}) :
								(this.state.loading) ?
								<CircularProgress color="success"/> :
								<NotFound></NotFound>
							}
					altaSectionName='AGREGAR NUEVO SERVICIO'
					onAltaSectionClick={()=>{this.onAltaSectionClick()}}
					onSearchChange={(searchValue)=>{this.onSearchChange(searchValue)}}
				>
				</PageContainer>
			</div>
		)
	}
}

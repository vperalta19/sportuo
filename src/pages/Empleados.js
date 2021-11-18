import React, { Component } from 'react'
import Empleado from '../components/Empleado';
import PageContainer from '../components/PageContainer';
import Modal from '../components/Modal';
import NotFound from '../components/NotFound';
import InputsItemContent from '../components/InputsItemContent';
import { endpointCall } from '../services/apiRoutes';
import {CircularProgress} from '@mui/material';

export default class Empleados extends Component {
    constructor(){
		super();
		this.state = {
			items: [],
			itemsBackup: [],
			modalIsOpen: false,
			modalTitle: 'Agregar nuevo empleado',
			modalContent: '',
			values: {},
			loading: false,
			liquidarModalContent: '',
			liquidarModalIsOpen: false
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

	getCreateItemModalContent(){
        return <InputsItemContent 
					ref={this.modalForm}
                    indications='Cargar los siguientes datos para crear un nuevo empleado'
                    properties={[
						{
							propertyId: 'type',
							propertyName: 'Tipo',
							nonEmpty: true,
							errorMsg: "Seleccione un tipo de empleado",
							select: true,
							list:	[{
										value: 1,
										label: 'Profesor'
									},
									{
										value: 2,
										label: 'Administrativo'
									}]
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
                            propertyName: 'Dirección',
							nonEmpty: true,
							errorMsg: "Ingrese una dirección"
                        },
						{
                            propertyId: 'cbu',
                            propertyName: 'CBU',
							nonEmpty: true,
							errorMsg: "Ingrese un cbu"
                        }
                    ]}
                    handleChange={(name, value)=>{this.handleChange(name, value)}}
                    values={this.state.values}
                >
                </InputsItemContent>
    }
    
    async componentDidMount(){
		this.fetchData();
	}

	async fetchData() {
		this.setState({
			loading: true,
			items: []
        })
		const response = await endpointCall("user/employees");
        const empleados  = await (await response.json()).data;
        this.setState({
			items: empleados,
			itemsBackup: empleados,
            modalContent: this.getCreateItemModalContent(),
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
			const response = await endpointCall("user/sign-up", this.state.values,'POST');
			if ((await response).ok) {
				this.setState({
					modalIsOpen: false
				})
				this.fetchData()
			}
		}
	}

	onCancel(){
		this.setState({
			modalIsOpen: false,
			liquidarModalIsOpen: false
		})
	}

	onSearchChange(searchValue){
		
		const listToFilter = Array.from(this.state.itemsBackup);
		const listFiltered = listToFilter.filter((element) => element.name.toUpperCase().includes(searchValue.toUpperCase()) || element.surname.toUpperCase().includes(searchValue.toUpperCase()));
		
		this.setState({
			items: listFiltered
		})
	}

	async liquidarSueldo(){
		this.setState({
			liquidarModalIsOpen: true,
			liquidarModalContent: <CircularProgress color="success"/> 
		})
		const response = await endpointCall("finance/pay-salary", {fechaFin: new Date()},'POST');
		this.setState({
			liquidarModalIsOpen: true,
			liquidarModalContent: (await response.json()).message
		})
	}

	getLiquidarSueldo(){
		return <div className='liquidar' onClick={()=>{this.liquidarSueldo()}}>
			LIQUIDAR SUELDOS
		</div>
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
				<Modal 
					content={this.state.liquidarModalContent} 
					isOpen={this.state.liquidarModalIsOpen}
					title="Liquidación de sueldos"
					acceptLabel="Aceptar"
					onAccept={()=>{this.onCancel()}}
					cancel={false}
				></Modal>
				<PageContainer 
					content={
								(this.state.items.length > 0) ? 
								this.state.items.map((item,key)=>{
									return <Empleado empleado={item} key={key} fetchData={()=>{this.fetchData()}}/>
								}) :
								(this.state.loading) ?
								<CircularProgress color="success"/> :
								<NotFound></NotFound>
							}
					altaSectionName='AGREGAR NUEVO EMPLEADO'
					onAltaSectionClick={()=>{this.onAltaSectionClick()}}
					onSearchChange={(searchValue)=>{this.onSearchChange(searchValue)}}
					otherOptions = {this.getLiquidarSueldo()}
				>
				</PageContainer>
			</div>
		)
	}
}

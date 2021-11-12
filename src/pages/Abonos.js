import React, { Component } from 'react'
import Abono from '../components/Abono';
import PageContainer from '../components/PageContainer';
import Modal from '../components/Modal';
import NotFound from '../components/NotFound';
import InputsItemContent from '../components/InputsItemContent';
import { endpointCall } from '../services/apiRoutes';
import {CircularProgress} from '@mui/material';

export default class Abonos extends Component {
    constructor(){
		super();
		this.state = {
			items: [],
			itemsBackup: [],
			modalIsOpen: false,
			modalTitle: 'Agregar nuevo abono',
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

    getCreateItemModalContent(){
        return <InputsItemContent 
					ref={this.modalForm}
                    indications='Cargar los siguientes datos para crear un nuevo abono'
                    properties={[
                        {
                            propertyId: 'type',
                            propertyName: 'Nombre',
							nonEmpty: true,
							errorMsg: "Utilice un nombre valido."
                        },
                        {
                            propertyId: 'price',
                            propertyName: 'Precio',
							propertyType: 'number',
							nonEmpty: true,
							errorMsg: "Escriba un precio." // TODO podemos hacer chequeo por numero positivo como el nonEmpty
                        },
						{
                            propertyId: 'length',
                            propertyName: 'Cantidad de días',
							propertyType: 'number',
							nonEmpty: true,
							errorMsg: "Escriba una cantidad de días." // TODO podemos hacer chequeo por numero positivo como el nonEmpty
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
		const response = await endpointCall("finance/get-subscriptions");
        const abonos  = await (await response.json()).data;
		if (response.status != 200) {
			return;
		}
        this.setState({
			items: abonos,
			itemsBackup: abonos,
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
			this.state.values.price = parseInt(this.state.values.price)
			this.state.values.length = parseInt(this.state.values.length)
			const response = await endpointCall("finance/new-subscription", this.state.values,'POST');
			if((await response).ok){
				this.setState({
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
									return <Abono abono={item} key={key} fetchData={()=>{this.fetchData()}}/>
								}) :
								(this.state.loading) ?
								<CircularProgress color="success"/> :
								<NotFound></NotFound>
							}
					altaSectionName='AGREGAR NUEVO ABONO'
					onAltaSectionClick={()=>{this.onAltaSectionClick()}}
					onSearchChange={(searchValue)=>{this.onSearchChange(searchValue)}}
				>
				</PageContainer>
			</div>
		)
	}
}

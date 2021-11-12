import React, { Component } from 'react';
import Item from "./Item";
import Modal from '../components/Modal'
import { endpointCall } from '../services/apiRoutes';
import InputsItemContent from './InputsItemContent';

export default class Abono extends Component {

	constructor(props){
		super(props);
		this.abono = props.abono;
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
			modifyAbono: Object.assign({}, props.abono),
			modalIsOpen: false,
			modalContent: <div></div>,
			modalTitle: '',
			onAccept: ()=>{ return; },
			onCancel: ()=>{this.onCancel()},
		}
		//estos dos ultimos tendrian que darse funcionalidad en los setModal
		this.modalForm = React.createRef();
	}

	setModalModificacion() {
		this.setState({
			modalIsOpen: true,
			modalTitle: 'Modificar',
			modalContent: this.getModalModificacionContent(),
			onAccept: ()=>{this.onAcceptModify()}
		})
	}

	handleChange = (name, value) => {
		const modifyAbono = this.state.modifyAbono;
		modifyAbono[name] = value;
		this.setState({
			modifyAbono: modifyAbono
		});
		this.modalForm.current.updateValues(modifyAbono);
    }

	getModalModificacionContent(){
		return <InputsItemContent 
					ref={this.modalForm}
					indications='Cargar los siguientes datos para crear un nuevo abono'
					properties={[
						{
							propertyId: 'price',
							propertyName: 'Precio',
							propertyType: 'number',
							nonEmpty: true,
							errorMsg: "Escriba un precio."
						}
					]}
					handleChange={(name, value)=>{this.handleChange(name, value)}}
					values={this.state.modifyAbono}
				>
				</InputsItemContent>
	}

	setModalBaja() {
		this.setState({
			modalIsOpen: true,
			modalTitle: 'Dar de baja',
			modalContent: <div>Seguro que quieres eliminar el abono: {this.abono.type}?</div>,
			onAccept: ()=>{this.deleteAbono()},
		})
	}

	async deleteAbono(){
		const response = await  endpointCall("finance", {id: this.abono.id},'DELETE');
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
			const response = await endpointCall("finance/subscription", this.state.modifyAbono,'PATCH');
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
			modifyAbono: Object.assign({}, this.abono),
			modalIsOpen: false
		})
	}

	getContent()
	{
		return (

			<div className='item-content-container'>
				<div className='info small'>
					<div className='property'>
						<div className='property-title'>Precio:</div>
						<div className='property-value'>${this.abono.price}</div>
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
				<Item content={this.getContent()} buttons={this.buttons} title={this.abono.type} openModal={() =>this.setState({isOpen: true})}/>
			</div>
		);
	}
}
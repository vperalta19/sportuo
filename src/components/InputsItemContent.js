import React, { Component } from 'react'
import DatePicker from 'react-date-picker';
import AsyncSelect from 'react-select/async';
import '../assets/css/InputsItemContent.css'

export default class InputsItemContent extends Component {
	constructor(props){
		super(props);
		this.state = {
			error: "",
			dateValues: {},
			values: props.values
		}
	}

	filter(filter, list)
	{
		let checks = filter.split(" ");

		return list.filter(
			(element) => {
				for (let i = 0; i < checks.length; i++) {
					const check = checks[i];
					if (!element.label.includes(check))
					{
						return false;
					}
				}
				return true;				
			}
		);
	}

	getPropertyInput(input,key){
		return (
					<div className="propertyContainer" key={key}> 
						<label htmlFor={input.propertyId} className='propertyLabel'>{input.propertyName.toUpperCase()}: </label>
						{
							input.select ? 
							<AsyncSelect 
								id={input.propertyId} 
								className='propertySelect'
								defaultOptions cacheOptions loadOptions={
									(filter, callback) => {
										setTimeout(() => {
											callback(this.filter(filter, input.list));
										}, 100);
									}
								}
								onChange={(item)=>{this.props.handleChange(input.propertyId, item.value)}}
								value={input.list.find((item) => { return item.value == this.state.values[input.propertyId]; })}
							/>
							: (
							input.date ?
							<DatePicker
								className='propertyDate'
								onChange={(date)=>{
									const values = this.state.dateValues;
									values[input.propertyId] = date;
									this.setState({
										dateValues: values
									});
									this.props.handleChange(input.propertyId, date)
								}}
								value={this.state.values[input.propertyId]}
							/>
							:
							<input  
								id={input.propertyId} 
								className='propertyInput' 
								onChange={(event)=>{this.props.handleChange(input.propertyId, event.target.value)}}
								type={input.propertyType}
								autoComplete="off"
								value={this.state.values[input.propertyId] || ""}
							></input>
						)}
					</div>
				)
	}

	checkForm()
	{
		for (let i = 0; i < this.props.properties.length; i++) {
			const property = this.props.properties[i];
			
			if (property.nonEmpty === true)
			{
				const value = this.props.values[property.propertyId];
				if (value == null || value.length === 0)
				{
					this.setState({
						error: (typeof property.errorMsg === 'undefined') ? "Error" : property.errorMsg
					})
					return false;
				}
			}
		}
		return true;
	}

	updateValues(values)
	{
		this.setState({
			values: values
		});
	}

	render() {
		return (
			<div className='input-item-content'>
				<div className='indications'>
					{this.props.indications}
				</div>
				<div className='content'>
					{
						this.props.properties.map(
							(element,key)=>{return this.getPropertyInput(element,key)})
					}
				</div>
				<div className='error-bar' hidden={this.state.error === null || this.state.error.length === 0}>
					{this.state.error}
				</div>
			</div>
		)
	}
}

import React, { Component } from 'react'
import '../assets/css/Pages.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export default class PageContainer extends Component {
    constructor(props){
        super(props);
        this.state = {
            inputValue: ''
        }
    }

    handleChange = (event) => {
        const {name, value} = event.target;
        this.setState({
            [name]: value
        })
        this.props.onSearchChange(value)
    }


    render() {
        return (
            <div className='container'>
				<div className='header-page'>
					<div>
						<div className='searcher-container'>
							<input className='searcher' type='text' value={this.state.inputValue} name="inputValue" onChange={this.handleChange}></input>
							<FontAwesomeIcon className='button-icon' icon={faSearch}/>
						</div>
					</div>	
					<div className='create-container'>
						<div className='alta' onClick={()=>{this.props.onAltaSectionClick()}}>{this.props.altaSectionName}</div>
                        {(this.props.otherOptions) ? this.props.otherOptions : ''}
					</div>		
                    
				</div>
				<div className='content-items'>
                    {this.props.content}
				</div>
			</div>
        )
    }
}

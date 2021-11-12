import React, { Component } from 'react';
import '../assets/css/Item.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown,faCaretUp, faEdit, faPlusCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons'

export default class Item extends Component {
    constructor(){
        super();
        this.state ={
            open: true,
        }
    }

    getButtonAction(attributes, key){
        let icon;
        if(attributes.action === 'alta'){
            icon = faPlusCircle;
        }
        else if(attributes.action === 'baja'){
            icon = faTrashAlt;
        }
        else{
            icon = faEdit;
        }
        return <div className={'button-action ' + attributes.action} onClick={() => {attributes.function()}} key={key}>
                    <div className='button-text'>{attributes.name}</div>
                    <FontAwesomeIcon className='button-icon' icon={icon}/>
                </div>
    }

    getActions(){
        const html = <div className='item-actions'>
                        {this.props.buttons.map((button, key)=>{
                            return this.getButtonAction(button, key)
                        })}
                    </div>

        return html;
    }

    toggleOpenItem(){
        this.setState({
            open: !this.state.open
        })
    }

    getHeader(){
        const html = <div className='item-header'>
                        <div className='item-name'>
                            <div className='name'>{this.props.title}</div>
                        </div>
                        {this.getActions()}
                        <div className='item-dropdown'>
                            <div className='button-dropdown' onClick={()=>{this.toggleOpenItem()}}>
                                <div className='button-text'>Mas información</div>
                                <FontAwesomeIcon className='button-icon' icon={(this.state.open) ? faCaretUp : faCaretDown}/>
                            </div>
                        </div>
                     </div>
        return html;
        
    }

    render() {
        let open = (this.state.open) ? 'open' : 'close';
        return (
            <div className={'item ' + open}>
                {this.getHeader()}
                <div className='item-content'>
                    {this.props.content}
                </div>
            </div>
        )
    }
}

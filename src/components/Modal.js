import React, { Component } from 'react'
import {Dialog,DialogTitle,DialogContent,DialogActions} from '@material-ui/core';
import '../assets/css/Modal.css'

export default class Modal extends Component {
    render() {
        return (
            <Dialog
                open={this.props.isOpen}
                onClose={()=>{this.props.onCancel()}}
                className='modal'
            >
                
                <DialogTitle id="modal-title">
                    {this.props.title}
                </DialogTitle>

                <DialogContent>
                    {this.props.content}
                </DialogContent>

                <DialogActions>
                    {(this.props.cancel) ? <div className='button-cancel' onClick={() => { this.props.onCancel(); }}  >
                        {this.props.cancelLabel ? this.props.cancelLabel: "Atras"}
                    </div> : ''}
                    
                    <div className='button-accept' onClick={() => { this.props.onAccept(); }} >
                        {this.props.acceptLabel ? this.props.acceptLabel : "Confirmar"}
                    </div>
                </DialogActions>

            </Dialog>
        )
    }
}

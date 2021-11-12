import React, { Component } from 'react'
import infoCircle from '../assets/img/info-circle.svg'
import '../assets/css/Pages.css'

export default class NotFound extends Component {
    render() {
        return (
            <div className='not-found'>
                <img src={infoCircle} alt='not found'></img>
                <span className='titulo-not-found'>No se encontraron datos</span>
            </div>
        )
    }
}

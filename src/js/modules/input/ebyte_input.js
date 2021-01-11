import {Input_Events, Input_Type} from '../../core/input/types.js';
import {Command_Template} from '../../core/input/commands/commands.js';

export class Input_Ebyte_Radio extends Command_Template{
    constructor()
    {
        super('EByte Radio');
    }
    
    render()
    {
        let lu = document.createElement('lu');
        lu.setAttribute('id','ebyte-input-list');
        lu.innerHTML = `<style>
                            #ebyte-input-list{ list-style-type: none;}
                            .ebyte-input-item{ padding: 5px; margin-bottom: 4px; cursor: pointer; background-color: cadetblue; }
                            .ebyte-input-item:hover{ background-color: yellow; }
                        </style>
                        <li class=ebyte-input-item data-value=C1C1C1>[C1C1C1] Reading operating parameters</li>
                        <li class=ebyte-input-item data-value=C3C3C3>[C3C3C3] Reading version number</li>
                        <li class=ebyte-input-item data-value=C4C4C4>[C4C4C4] Reset device</li>`;
        
        lu.querySelectorAll('.ebyte-input-item').forEach(comm => {
            comm.addEventListener('click', ev => {
                if(ev.detail > 1) return;
                this.emit(Input_Events.SET_INPUT, {data: ev.target.dataset.value, type: Input_Type.hex.value});
            });
            comm.addEventListener('dblclick', ev => {
                this.emit(Input_Events.SEND_INPUT, {data: ev.target.dataset.value, type: Input_Type.hex.value});
            });
        })
        
        return lu;
    }
}
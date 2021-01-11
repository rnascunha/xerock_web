import {Input_Events, Input_Type} from '../../core/input/types.js';
import {Command_Template} from '../../core/input/commands/commands.js';
import {Byte_Array} from '../../libs/byte_array/byte_array.js';
import {copy_clipboard} from '../../helper/util.js';

export class Custom_Input extends Command_Template{
    constructor()
    {
        super('Custom Input');
    }
    
    render()
    {
        let el = document.createElement('div');
        el.innerHTML = `
<style>
    #container
    {
        min-height: 100px;
        max-height: 300px;
        min-width: 300px;
        overflow: auto;
    }

    #button-container
    {
        width: 100%;
        display: flex;
        flex-direction: row;
    }

    .flex-btn
    {
        cursor: pointer;
        margin: 0px;
        flex-basis: 1;
        padding: 5px;
        font-size: 25px;
    }

    #send-btn
    {
        flex-grow: 4;
    }

    #error
    {
        background-color: red;
        color: white;
        margin: 0px;
        padding: 2px;
    }
</style>
<custom-protocol id=container add-btn=false calculate-btn=false></custom-protocol>
<div id=error>Invalid field value</div>
<div id=button-container>
    <button class=flex-btn id=add-btn title="Add field">+</button>
    <button class=flex-btn id=copy-btn title="Copy">&#x2398;</button>
    <button class=flex-btn id=send-btn title=Send>&#x25B6;</button>
</div>
`;
        const container = el.querySelector('#container'),
            send_btn = el.querySelector('#send-btn'),
            error_el = el.querySelector('#error');
        
        const error = e => {
            error_el.style.display = e ? 'block' : 'none';
        }
        
        const calc = () => {
            let data = container.calculate(false);
            error(!data.status);
            
            if(data.status)
            {
                let ba = new Byte_Array();
                ba.raw(data.data);
                return ba.hex();
            }   
            return null;
        }
        
        error(false);
        container.add();
        
        el.querySelector('#add-btn').addEventListener('click', container.add.bind(container));
        
        el.querySelector('#copy-btn').addEventListener('click', ev => {
            let data = calc();
            if(data)
                copy_clipboard(data);
        });
                        
        send_btn.addEventListener('click', ev => {
            let data = calc();
            if(data)
                this.emit(Input_Events.SET_INPUT, {data: data, type: Input_Type.hex.value});
        });
        
        send_btn.addEventListener('dblclick', ev => {
            let data = calc();
            if(data)
                this.emit(Input_Events.SEND_INPUT, {data: data, type: Input_Type.hex.value});
        });
        
        return el;
    }
}
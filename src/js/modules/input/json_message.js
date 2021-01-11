import {Input_Events, Input_Type} from '../../core/input/types.js';
import {Command_Template} from '../../core/input/commands/commands.js';
import {copy_clipboard} from '../../helper/util.js';

export class Input_JSON_Message extends Command_Template
{
    constructor()
    {
        super('JSON Message');
    }
    
    render()
    {
        let el = document.createElement('div');
        el.id = 'container';

        el.innerHTML = `
<style>
    #container
    {
        background-color: bisque;
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
</style>
<json-message id=message></json-message>
<div id=button-container>
    <button class=flex-btn id=copy-btn title="Copy">&#x2398;</button>
    <button class=flex-btn id=send-btn title=Send>&#x25B6;</button>
</div>`;
        
        const send_btn = el.querySelector('#send-btn'),
              message = el.querySelector('#message');
        
        el.querySelector('#copy-btn').addEventListener('click', ev => {
            copy_clipboard(JSON.stringify(message.message()));
        });
                        
        send_btn.addEventListener('click', ev => {
            this.emit(Input_Events.SET_INPUT, {data: JSON.stringify(message.message()), type: Input_Type.text.value});
        });
        
        send_btn.addEventListener('dblclick', ev => {
            this.emit(Input_Events.SEND_INPUT, {data: JSON.stringify(message.message()), type: Input_Type.text.value});
        });
        
        return el;
    }
}
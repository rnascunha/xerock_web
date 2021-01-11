import {BR_Version, BR_Message_Type, BR_Command_Type,
       Node_Version, Node_Message_Type, Node_Command_Type} from './type.js';
import {get_selected} from '../../helper/helpers_basic.js';
import {Byte_Array} from '../../libs/byte_array/byte_array.js';
import {Data_Type} from '../../libs/byte_array/types.js';
import {copy_clipboard} from '../../helper/util.js';

function make_select_ops(obj, el)
{
    Object.keys(obj).forEach(value => {
        let op = document.createElement('option');
        op.value = obj[value];
        op.textContent = value;

        el.appendChild(op);
    });
}

customElements.define('esp32-br-input', class extends HTMLElement {
    constructor()
    {
        super();

        // Create shadow DOM for the component.
        this._shadow = this.attachShadow({mode: 'open'});
        this._shadow.innerHTML = `
            <style>
            :host{
                background-color: orange;
                border-radius: 3px;
                display: inline-block;
            }

            #input-mesh-container{
                display: inline-flex;
                flex-wrap: wrap;
            }

            .flex-item{
                padding: 5px 5px 0px 5px;
                margin: 3px 3px;
                text-align: center;
                border-radius: 10px;
            }

            .header{
                background-color: green;
            }

            .data{
                background-color: yellow;
            }

            .command{
                background-color: darkturquoise;
            }

            #button-submit{
                display: block;
            }

            #br-message-error{
                background: red;
                color: white;
                display: block;
                border-radius: 3px;
            }
            </style>
            <div id=input-mesh-container>
                <div class='header flex-item' title='BR Version'>
                    <select id=br-message-version class=header-field></select>
                    <div id=output-br-version class=header-field></div> 
                </div>
                <div class='header flex-item' title='Message type'>
                   <select id=br-mesh-message-type class=header-field></select>
                   <div id=output-type class=header-field></div> 
                </div>
                <div class='header flex-item' title='Message size'>
                    <div id=br-message-size-size class=header-field>Size</div>
                    <div id=output-size class=header-field>0</div>
                </div>
                <div class='data flex-item' title='MAC address to'>
                    <input-x id=br-mesh-data-addr-input>
                        <input-mac slot=input id=br-mesh-data-addr class=data-field placeholder="MAC Address"></input-mac>
                    </input-x>
                    <div id=output-addr class=data-field></div>
                </div>
                <div class='data flex-item' title='Node Version'>
                    <select id=node-message-version class=data-field></select>
                    <div id=output-node-version class=data-field></div> 
                </div>
                <div class='data flex-item' title='Node message type'>
                   <select id=node-mesh-message-type class=data-field></select>
                   <div id=output-node-type class=data-field></div> 
                </div>
                <div class='data flex-item' title='Node message size'>
                    <div id=node-message-size-size class=data-field>Size</div>
                    <div id=output-node-size class=data-field>0</div>
                </div>
                <div class='data data-command flex-item' title='Command to Node'>
                    <select id=node-mesh-command-comm class=data-field></select>
                    <div id=output-node-command class=data-field></div>
                </div>
                <div class='data flex-item' title='Message'>
                    <input id=br-mesh-data-data class=data-field placeholder="Send data">
                    <div id=output-data class=data-field></div>
                </div>
                <div class='command flex-item' title='Command to BR'>
                    <select id=br-mesh-command-comm class=command-field></select>
                    <div id=output-command class=command-field></div>
                </div>
                <div class='command flex-item' title="Command argument">
                    <input id=br-mesh-command-arg class=command-field placeholder="Command argument">
                    <div id=output-comm-arg class=command-field></div>
                </div>
                <div class='button flex-item'>
                    <button id=button-submit title=Send>&#x25B6;</button>
                    <button id=button-copy title=Copy>&#x2398;</button>
                </div>
                <slot class=flex-item></slot>
            </div>
            <div id=br-message-error></div>`;
        
        this._br_version = this._shadow.querySelector('#br-message-version');
        this._message_type = this._shadow.querySelector('#br-mesh-message-type');
        this._command_type = this._shadow.querySelector('#br-mesh-command-comm');
        
        this._node_version = this._shadow.querySelector('#node-message-version'); 
        this._node_message_type = this._shadow.querySelector('#node-mesh-message-type');
        this._node_command_type = this._shadow.querySelector('#node-mesh-command-comm');
        
        make_select_ops(BR_Version, this._br_version);
        make_select_ops(BR_Message_Type, this._message_type);
        make_select_ops(BR_Command_Type, this._command_type);
        make_select_ops(Node_Version, this._node_version);
        make_select_ops(Node_Message_Type, this._node_message_type);        
        make_select_ops(Node_Command_Type, this._node_command_type);

        
        this._shadow.querySelector('#br-mesh-data-addr-input').eraseable.onclick = event => {
            this._shadow.querySelector('#br-mesh-data-addr').value = '';
            this._shadow.querySelector('#br-mesh-data-addr').focus();
        }
                
        this._set_message_type(this._message_type);
        this._message_type.onchange = event => {
             this._set_message_type(event.target);
        }
        
        this._set_node_message_type();
        this._node_message_type.onchange = event => {
            this._set_node_message_type();
        }
        
        this._event_send_click = new Event('send_click');        
        this._shadow.querySelector('#button-submit').onclick = ev => {
            if(ev.detail > 1) return;
            this.calculate_set_values();
            this.dispatchEvent(this._event_send_click);
        }
        
        this._event_send_dbl_click = new Event('send_dbl_click');
        this._shadow.querySelector('#button-submit').ondblclick = ev => {
            this.calculate_set_values();
            this.dispatchEvent(this._event_send_dbl_click);
        }
                
        this._event_copy = new Event('copy');
        this._shadow.querySelector('#button-copy').onclick = ev => {
            this.calculate_set_values()
            copy_clipboard(this.value_str);
            this.dispatchEvent(this._event_copy);
        }
                
        this.error = '';
        this.value = null;
        this.value_str = '';
    }
    
    calculate_set_values()
    {
        let data = this._calculate();
        if(data)
        {
            this.value = data;
            let dc = new Byte_Array();
            if(!dc.raw(data)) return;
            this.value_str = dc.hex();
        } else {
            this.value = null;
            this.value_str = '';
        }
    }
    
    mac(mac = null)
    {
        let m = this._shadow.querySelector('#br-mesh-data-addr');
        if(mac !== null) m.value = mac;
        return m.value;
    }
            
    _select_data(en)
    {
        this._shadow.querySelectorAll('.data').forEach(cell => {
            cell.style.display = en ? 'block' : 'none';
        });

        this._shadow.querySelectorAll('.command').forEach(cell => {
            cell.style.display = !en ? 'block' : 'none';
        })
        
        if(en){
            this._set_node_message_type();
        }
    }
    
    _select_node_data(en)
    {
        this._shadow.querySelectorAll('.data-command').forEach(cell => {
            cell.style.display = en ? 'none' : 'block';
        });
    }

    _set_output_header(version, type, size)
    {
        let dc = new Byte_Array();
        
        dc.from(version, Data_Type.uint8.value);
        this._shadow.querySelector('#output-br-version').textContent = dc.hex();
        
        dc.from(type, Data_Type.uint8.value);
        this._shadow.querySelector('#output-type').textContent = dc.hex();
        this._shadow.querySelector('#br-message-size-size').textContent = size;
        
        dc.from(size, Data_Type.uint16be.value);
        this._shadow.querySelector('#output-size').textContent = dc.hex();
    }

    _set_output_data(addr, version, type, size, command, data)
    {
        let dc = new Byte_Array();
        
        dc.from(addr, Data_Type.hex.value);
        this._shadow.querySelector('#output-addr').textContent = dc.hex();

        dc.from(version, Data_Type.uint8.value);
        this._shadow.querySelector('#output-node-version').textContent = dc.hex();
        
        dc.from(type, Data_Type.uint8.value);
        this._shadow.querySelector('#output-node-type').textContent = dc.hex();
        
        dc.from(size, Data_Type.uint16be.value);
        this._shadow.querySelector('#output-node-size').textContent = dc.hex();
                
        dc.from(command, Data_Type.uint8.value);
        this._shadow.querySelector('#output-node-command').textContent = dc.hex();
            
        dc.from(data, Data_Type.text.value);
        this._shadow.querySelector('#output-data').textContent = dc.hex();
    }

    _set_output_command(comm, arg)
    {
        let dc = new Byte_Array();
        dc.from(comm, Data_Type.uint8.value);
        this._shadow.querySelector('#output-command').textContent = dc.hex();
        if(arg.length)
        {
            dc.from(arg, Data_Type.text.value);
            this._shadow.querySelector('#output-comm-arg').textContent = dc.hex();
        }
    }

    _set_message_type()
    {
        let el = this._message_type,
            op = +get_selected(el).value;
        switch(op){
            case BR_Message_Type.DATA:
                this._select_data(true);
                break;
            case BR_Message_Type.COMMAND:
                this._select_data(false);
                break;
            default:
                console.log('Error! Type message not defined');
                break;
        }
    }
    
    _set_node_message_type()
    {
        let el = this._node_message_type,
            op = +get_selected(el).value;
        switch(op){
            case Node_Message_Type.DATA:
                this._select_node_data(true);
                break;
            case Node_Message_Type.COMMAND:
                this._select_node_data(false);
                break;
        }
    }

    _error(message)
    {
        this._shadow.querySelector('#br-message-error').textContent = message;
        this.error = message;
    }
    
    _data_output()
    {
        let dc = new Byte_Array();
        let message = {},
            node_version = get_selected(this._node_version).value,
            node_command = get_selected(this._node_command_type).value,
            input_addr = this._shadow.querySelector('#br-mesh-data-addr'),
            input_type = get_selected(this._node_message_type).value,
            input_data = this._shadow.querySelector('#br-mesh-data-data');

        if(!input_addr.is_valid()){
            this._error(`"${input_addr.value}" is not a valid MAC addr`);
            return false;
        }
        
        dc.from(input_addr.value.replace(/:/g, ''), Data_Type.hex.value);
        message.addr = dc.raw();

        //Node version
        dc.from(node_version, Data_Type.uint8.value);
        message.node_version = dc.raw();
        
        //Node message type
        dc.from(input_type, Data_Type.uint8.value);
        message.node_type = dc.raw();
        
        //Node command
        message.node_command = [];
        if(input_type == Node_Message_Type.COMMAND)
        {
            dc.from(node_command, Data_Type.uint8.value);
            message.node_command = dc.raw();            
        } else if(input_data.value.length == 0){
            this._error(`Data field is empty`);
            return false;
        }
        
        //Node data
        dc.from(input_data.value, Data_Type.text.value);
        message.data = dc.raw();
        
        let node_data = [].concat(message.node_command, message.data);
        let node_size = node_data.length;
        dc.from(node_size, Data_Type.uint16be.value);
        message.node_size = dc.raw();
        
        let data = [].concat(message.addr, message.node_version, message.node_type, message.node_size, node_data);
        let size = data.length;

        //Message Header
        //BR version
        let br_version = get_selected(this._br_version).value;
        dc.from(br_version, Data_Type.uint8.value);
        let br_version_arr = dc.raw();
        
        dc.from(BR_Message_Type.DATA, Data_Type.uint8.value);
        let byte_message = dc.raw();
        dc.from(`${size}`, Data_Type.uint16be.value);
        byte_message = [].concat(br_version_arr, byte_message, dc.raw(), data);

        input_addr.add(input_addr.value);

        this._set_output_header(br_version, BR_Message_Type.DATA, size);
        this._set_output_data(input_addr.value.replace(/:/g, ''), node_version, input_type, node_size, node_command, input_data.value);

//        input_data.value = "";
        this._error('');

        return byte_message;
    }

    _command_output()
    {
        let dc = new Byte_Array(),
            comm = get_selected(this._shadow.querySelector('#br-mesh-command-comm')).value;

        dc.from(comm, Data_Type.uint8.value);
        let comm_arr = dc.raw();

        dc.from(BR_Message_Type.COMMAND, Data_Type.uint8.value)
        let command_msg = dc.raw();

        let arg = this._shadow.querySelector('#br-mesh-command-arg').value,
            arg_arr = [];
        if(arg.length)
        {
            dc.from(arg, Data_Type.text.value);
            arg_arr = dc.raw();
        }
         
        let br_version = get_selected(this._br_version).value;
        dc.from(br_version, Data_Type.uint8.value);
        let br_version_arr = dc.raw();

        let size = comm_arr.length + arg_arr.length;
        dc.from(`${size}`, Data_Type.uint16be.value);
        let size_arr = dc.raw();
                
        command_msg = [].concat(br_version_arr, command_msg, size_arr, comm_arr, arg_arr);

        this._set_output_header(br_version, BR_Message_Type.COMMAND, size);
        this._set_output_command(comm, arg);

        this._error('');

        return command_msg;
    }

    _calculate()
    {
        let op = +get_selected(this._message_type).value
        switch(op){
            case BR_Message_Type.DATA:
                return this._data_output();
                break;
            case BR_Message_Type.COMMAND:
                return this._command_output();
                break;
            default:
                console.log('Error submit');
                break;
        }
        return false;
    }
});
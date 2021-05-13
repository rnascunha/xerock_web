import {Byte_Array} from '../../../libs/byte_array/byte_array.js';
import {Data_Type} from '../../../libs/byte_array/types.js';

const template_bc = document.createElement('template')
template_bc.innerHTML = `
<style>
    table{
        border-collapse: collapse;
        border-radius: 10px;
        overflow: hidden;
        /*border: 1px solid black;*/
    }

    td, th{
        padding: 2px;
        text-align: center;
        /*border: 1px solid black;*/
    }

    .header{
        background-color: orange;
    }

    .option{
        background-color: bisque;
    }

    .payload{
        background-color: yellow;
    }

    #error{
        background-color: red;
    }

    #error-data{
        font-weight: bold;
    }
</style>
<table>
    <thead id=headers-container>
        <tr>
            <th class=header>Header</th>
            <th class=option>Options</th>
            <th class=payload title='Payload Marker'>PM</th>
            <th class=payload>Payload</th>
        <tr>
    <thead>
    <tbody>
        <tr id=data>
            <td id=header class=header></td>
            <td id=option class=option></td>
            <td id=payload-marker class=payload></td>
            <td id=payload class=payload></td>
        <tr>
        <tr id=error>
            <td id=error-data colspan=4></td>
        </tr>
    <tbody>
</table>
`;

export function coap_byte_code(container, data_serial, data_parsed, config = {})
{
    let shadow;
    if(!container.shadowRoot)
        shadow = container.attachShadow({mode: 'open'});
    else
    {
        shadow = container.shadowRoot;
        shadow.innerHTML = '';
    }
    shadow.appendChild(template_bc.content.cloneNode(true));
    
    config = typeof config == 'object' ? config : {};
    const show_unused = 'show_unused' in config ? Boolean(config.show_unused) : true,
          show_headers = 'show_headers' in config ? Boolean(config.show_headers) : true;
    
    if(!show_headers)
    {
        shadow.querySelector('#headers-container').style.display = 'none';
    }
    
    const header = shadow.querySelector('#header'),
          options = shadow.querySelector('#option'),
          payload = shadow.querySelector('#payload'),
          payload_marker = shadow.querySelector('#payload-marker');
    
    /**
     * Error checking
     */
    const error = shadow.querySelector('#error'),
          error_data = shadow.querySelector('#error-data'),
          data = shadow.querySelector('#data');
    if(data_parsed.has_error)
    {
        data.style.display = 'none';
        error.style.display = 'table-row';
        error_data.textContent = data_parsed.error.join(' | ');
        return;
    }
    else
    {
        data.style.display = 'table-row';
        error.style.display = 'none';
        error_data.textContent = '';
    }
    
    const header_size = data_parsed.conn_type == 'reliable' ? data_parsed.header_size : data_parsed.data.token_len + 4,
            option_size = data_parsed.data.options.size,
            payload_size = data_parsed.data.payload.length;
    
    header.textContent = Byte_Array.to(data_serial.data.slice(0, header_size), Data_Type.hex.value);
    if(option_size)
    {
        options.textContent = Byte_Array.to(data_serial.data.slice(header_size, header_size + option_size), Data_Type.hex.value);
        if(!show_unused)
            shadow.querySelectorAll('.option').forEach(op => {op.style.display = 'table-cell'; });
    }
    else
    {
        options.textContent = '';
        if(!show_unused)
            shadow.querySelectorAll('.option').forEach(op => {op.style.display = 'none'; });
    }
    
    if(payload_size)
    {
        payload.textContent = Byte_Array.to(
            data_serial.data.slice(header_size + option_size + 1, header_size + option_size + payload_size + 1), 
            Data_Type.hex.value);
        payload_marker.textContent = 'ff';
        if(!show_unused)
            shadow.querySelectorAll('.payload').forEach(op => {op.style.display = 'table-cell'; });
    }
    else
    {
        payload.textContent = '';
        payload_marker.textContent = '';
        if(!show_unused)
            shadow.querySelectorAll('.payload').forEach(op => {op.style.display = 'none'; });
    }
}
import {format_data} from './format.js';
import {DATETIME_FORMAT, TIME_PRECISION, Date_Time_Format} from '../../time_format.js';
import {columns} from '../libs/select/types.js';
import {Message_Type, 
        Control_Type, 
        Message_Direction} from '../libs/message_factory.js';
import {Output_Type} from './types.js';

export function make_data_details(data, options)
{
    options.time_format = DATETIME_FORMAT.DATETIME.value;
    options.time_precision = TIME_PRECISION.MICROSECONDS.value;
    
    let f_data = format_data(data, options),
        container = document.createElement('div'),
        shadow =  container.attachShadow({mode: 'open'});
    
    container.id = 'container-data-details';
    
    shadow.innerHTML = `
<style>
    #container
    {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
        box-sizing: border-box;
        padding: 0px 15px 3px 20px;
    }

    h2{ margin: 10px 3px;}
    #outer-container
    {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        box-sizing: border-box;
        height: 100%;
        overflow: auto;
    }

    #data-container
    {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        box-sizing: border-box;
        height: 100%;
        overflow: auto;
    }

    #data 
    {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .field-data
    {
        display: inline-flex;
        flex-direction: row;
        border-radius: 5px;
        overflow: auto;
        margin: 0px 5px 5px 0px;
        text-align: center;
    }

    .title
    {
        background-color: bisque;
        padding: 5px;
        font-weight: bold;
    }

    .value
    {
        background-color: azure;
        padding: 5px;
    }

    #payload
    {
        flex-basis: auto;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        overflow-y: auto;
    }

    #payload .value
    {
        padding: 10px;
        display: inline-flex;
        flex-direction: row;
        overflow: auto;
        flex-grow: 1;
        align-items: flex-start;
    }

    .payload-value
    {
        white-space: pre;
        text-align: left;
        background-color: antiquewhite;
        padding: 5px;
        border-radius: 5px;
        margin: 0px 5px 5px 0px;
    }

    .data-field
    { 
        align-self: stretch;
        padding: 0px;
    }

    .command
    {
        padding: 5px 10px;
        float: right;
        cursor: pointer;
        border-radius: 5px;
    }

    #delete
    {
        background-color: white;
        color: red;
        font-weight: bold;
    }

    #delete:hover
    {
        background-color: red;
        color: white;
    }

    #arrow-container
    {
        position: absolute;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        height: 100%;
        align-items: center;
    }

    .arrow
    {
        padding: 40px 5px;
        cursor: pointer;
        vertial-align: middle;
        z-index: 15;
    }

    .arrow:hover
    {
        background-color: lightgrey;
    }
    
    #left:after{ content: '\u2770'; }
    #right:after{ content: '\u2771'; }

</style>
<div id=arrow-container>
    <div class=arrow id=left data-value=left></div>
    <div class=arrow id=right data-value=right></div>
</div>
<div id=container>
    <div id=outer-container>
        <h2>Details</h2>
        <div id=data-container>
            <div id=data></div>
            <div id=payload class=field-data>
                <span class=title>Payload</span>
                <span class=value></span>
            </div>
        </div>
    </div>
    <div id=commands-container>
        <hr>
        <div id=commands><button class=command id=delete data-value=delete>Delete</button></div>
    </div>
</div>`;    
    let data_container = shadow.querySelector('#data'),
        payload_container = shadow.querySelector('#payload').querySelector('.value');
    Object.keys(f_data).forEach(attr => {        
        
        const add_option = (title, value, container = data_container) => {
            let div = document.createElement('div');
            div.classList.add('field-data');
            div.innerHTML = `<span class=title>${title}</span><span class=value>${value}</span>`;

            container.appendChild(div);
        }
        
        switch(attr)
        {
            case 'file':
            case 'mid':
            case 'sid':
            case 'smid':
            case 'uid':
            case 'sname':
            case 'saddr':
            case 'app':
            case 'session':
            case 'type':
            case 'from':
                if(attr in f_data)
                    add_option(columns[attr].description, f_data[attr]);
                break;
            case 'time':
                add_option(columns[attr].description, `${f_data[attr]} (${data.time})`);
                break;
            case 'id':
                add_option(data.type === Message_Type.data.value ? 
                                'App ID' : Message_Type.control.name, 
                            f_data[attr]);
                break;
            case 'dir':
                add_option(columns[attr].description, `${Message_Direction[data.dir].value} (${f_data[attr]})`);
                break;
            case 'size':
            break;
            case 'payload':
                if(!Array.isArray(f_data.payload)) f_data.payload = [f_data.payload];
                if(!('data_field' in data))
                {
                    f_data.payload.forEach(d => {
                        let span = document.createElement('span');
                        span.classList.add('payload-value');
                        span.textContent = d;
                        payload_container.appendChild(span);
                    });
                } else {
                    add_option(columns['size'].description, f_data.size);
                    f_data.payload.forEach((d, idx) => {
                        if(idx !== data.data_field){
                            let span = document.createElement('span');
                            span.classList.add('payload-value');
                            span.textContent = d;
                            payload_container.appendChild(span);
                        } else {
                            let c = document.createElement('convert-container');
                            c.classList.add('payload-value', 'data-field');
                            Object.values(Output_Type).forEach(type => {
                                if(type.value !== Output_Type.NONE.value)
                                    c.add_type(type.value);
                            });
                            c.value(d, f_data.payload_type);
                            payload_container.appendChild(c);
                        }
                    });
                }
            break;
            default:
            break;
        }        
    });
    
    return container;
}

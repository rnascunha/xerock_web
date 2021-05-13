import {Event_Emitter} from '../../../libs/event_emitter.js';
import {Events, GATT_Service_List} from './types.js';
import {WebBluetooth_ID} from './id.js';
import {event_path} from '../../../helper/compatibility.js';

import style from './webbluetooth.css';

const template = document.createElement('template');
template.innerHTML = `
<div id=request-container>
    <div id=request-options>
        <div class=request-opt>
            <div class=request-label>Service</div>
            <input id=services class=request-input list=services-list></input>
            <datalist id=services-list></datalist>
        </div>
        <div class=request-opt>
            <div class=request-label>Name</div>
            <input id=name class=request-input></input>
        </div>
        <div class=request-opt>
            <div class=request-label>Name Prefix</div>
            <input id=name-prefix class=request-input></input>
        </div>
    </div>
    <div>
        <button id=request class='button-request'>Request</button>
        <button id=update class='button-request'>Update</button>
        <button id=scanle class=button-request>Scan LE</button>
    </div>
</div>
<closeable-status id=error behaviour=hidden></closeable-status>
<table>
    <tr id=header-line><th id=device-name>Devices</th><th id=device-op>#</th></tr>
    <tbody id=device-container></tbody>
</table>`;

export class WebBluetooth_View extends Event_Emitter
{
    constructor(model)
    {
        super();
        
        this._model = model;
        this._container = null;
        
        this._model.on(Events.ERROR, error => this.error(error))
                    .on(Events.ADD_DEVICE, dev => this.render_devices())
                    .on(Events.OPEN, dev => this.render_devices());
    }
        
    render(container)
    {
        this._container = container;
        
        const style_el = document.createElement('style');
        style_el.innerHTML = style.toString();
        this._container.appendChild(style_el);
        
        navigator.bluetooth.getAvailability().then(av => {
            if(av)
                this.render_avaiable();
            else
                this.render_non_avaiable();
        });
    }
    
    render_avaiable()
    {
        this._container.appendChild(template.content.cloneNode(true));
        
        /**
        * Aparently appendChild or cloneNode doesn't work syncronously
        */
        setTimeout(() => {
            let service_list = this._container.querySelector('#services-list');
            GATT_Service_List.forEach(service => {
               let op = document.createElement('option');
                op.value = service;
                service_list.appendChild(op);
            });

            this._container.querySelector('#request').onclick = ev => {
                let filters = [];

                let service = this._container.querySelector('#services').value;
                if (service.startsWith('0x')) service = parseInt(service);
                if (service) filters.push({services: [service]});

                let name = this._container.querySelector('#name').value;
                if (name) 
                    filters.push({name: name});

                let name_prefix = this._container.querySelector('#name-prefix').value;
                if (name_prefix)
                    filters.push({namePrefix: name_prefix});
                
                this.emit(Events.REQUEST, filters.length ? filters : null);
            }

            this._container.querySelector('#update').onclick = ev => {
                this.emit(Events.GET);
            }
            
            this._container.querySelector('#scanle').onclick = ev => {
                let filters = [];

                let name = this._container.querySelector('#name').value;
                if (name) 
                    filters.push({name: name});

                let name_prefix = this._container.querySelector('#name-prefix').value;
                if (name_prefix)
                    filters.push({namePrefix: name_prefix});
                
                this.emit(Events.SCAN_LE, filters.length ? filters : null);
            }

            this.render_devices();
        }, 0);
        this._container.querySelector('#device-container').addEventListener('click', ev => {
            let path = event_path(ev);
            
            if('value' in path[0].dataset)
            {
                let dev = this._model.device_by_id(path[0].dataset.value);
                if(!dev)
                {
                    this.error('Device not found [${path[0].dataset.value}]');
                    return;
                }
                
                if(dev.is_open()) 
                    this.emit(Events.CLOSE, dev);
                else 
                    this.emit(Events.OPEN, dev);
            }
        });
    }
    
    render_non_avaiable()
    {
        let div = document.createElement('div');
        div.id = 'no-device';
        
        div.textContent = "This device doesn't have Bluetooth";
        
        this._container.appendChild(div);
    }
    
    request_devices()
    {
        let filter = {};
        
        this._container.querySelectorAll('.request-input').forEach(f => {
            let value = parseInt(f.value.trim());
            if(value){
                filter[f.id] = value;
                f.classList.remove('input-error');
            } else {
                f.classList.add('input-error');
            }
        });
        
        this.emit(Events.REQUEST, Object.keys(filter).length > 0 ? filter : null);
    }
    
    render_devices()
    {
        let dev_container = this._container.querySelector('#device-container');
        if(!dev_container) return;
        
        if(this._model.devices().length == 0)
        {
            dev_container.innerHTML = '<tr><td id=no-device colspan=2>No devices found</td></tr>';
            return;
        }
        
        dev_container.innerHTML = '';
        this._model.devices().forEach(dev => {
            let line = document.createElement('tr');
            
            line.title = `name: ${dev.name()}\nid: ${dev.device().id}`;
            
            let name = document.createElement('td'),
                op = document.createElement('td');
            
            name.classList.add('device-name');
            name.textContent = dev.name();
            
            name.addEventListener('click', event => { console.log(dev); });
            
            op.classList.add('device-op');
            op.dataset.opened = dev.is_open();
            op.dataset.value = dev.device().id;
            
            line.appendChild(name);
            line.appendChild(op);
            
            dev_container.appendChild(line);
        });
    }
    
    error(msg)
    {
        this._container.querySelector('#error').value = msg;
    }
}
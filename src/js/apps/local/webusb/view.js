import {Event_Emitter} from '../../../libs/event_emitter.js';
import {Events} from './types.js';
import {WebUSB_ID} from './id.js';

import style from './webusb.css';

const filters = [
    {value: 'vendorId', label: 'VendorID', title: 'Vendor ID'},
    {value: 'productId', label: 'ProductID', title: 'Product ID'},
    {value: 'serialNumber', label: 'Serial', title: 'Serial Number'},
//    {value: 'classCode', label: 'Class', title: 'Class Code'},
//    {value: 'subclassCode', label: 'SubClass', title: 'SubClass Code'},
//    {value: 'protocolCode', label: 'Protocol', title: 'Protocol Code'}
];

const template = document.createElement('template');
template.innerHTML = `
<div id=request-options></div>
<button id=request>Request</button>
<button id=update>Update</button>
<closeable-status id=error behaviour=hidden></closeable-status>
<table>
    <tr id=header-line><th id=device-name>Devices</th><th id=device-op>#</th></tr>
    <tbody id=device-container></tbody>
</table>
`;

export class WebUSB_View extends Event_Emitter
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
        this._container.appendChild(template.content.cloneNode(true));
        
        let opts = this._container.querySelector('#request-options');
        opts.innerHTML = '';
        filters.forEach(f => {
           opts.innerHTML +=  `<div class=request-opt title='${f.title}'>
                                <div class=request-label>${f.label}</div>
                                <input id=${f.value} class=request-input></input>
                            </div>`;
        });
        
        this._container.querySelector('#request').onclick = ev => {
            this.request_devices();            
        }
        
        this._container.querySelector('#update').onclick = ev => {
            this.emit(Events.GET);
        }
        
        this.render_devices();
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
        
        if(Object.keys(filter).length > 0)
            this.emit(Events.REQUEST, filter);
    }
    
    render_devices()
    {
        if(!this._container) return;
        
        let container = this._container.querySelector('#device-container');
        
        if(this._model.devices().length == 0){
            container.innerHTML = '<tr><td colspan=2 class=device-name>No device detected</td></tr>';
            return;
        }
        
        container.innerHTML = '';
        this._model.devices().forEach(d =>{
            let device = d.device();

            let line = document.createElement('tr');
            line.innerHTML = `<td class=device-name title='${this._title(device)}'>
                                <span>${device.productName}</span>
                                <!--<button class='signal dtr'>DTR</button>
                                <button class='signal rts'>RTS</button>
                                <button class='signal brk'>BRK</button>-->
                            </td>
                              <td class=device-op data-opened=${device.opened}>
                                ${device.opened ? 
                                        '&times;' : 
                                        '<drop-menu class=drivers><span slot=title>&#9658;</span></drop-menu>'}
                            </td>`;
            //
            
            let drivers = this._model.drivers();
            if(drivers.length === 0)
            {
                drivers_el.disabled = true;
                drivers_el.title = "No driver installed";
            } else if(!device.opened){
                let drivers_el = line.querySelector('.drivers');
                
                drivers_el.title = "";
                drivers_el.disabled = false;
                let list = document.createElement('lu');
                list.classList.add('driver-list')
                drivers.forEach(driver => {
                    let opt = document.createElement('li');
                    opt.textContent = `${driver.name}`;
                    opt.classList.add('driver-op');
                    
                    opt.onclick = ev => {
                        this.emit(Events.OPEN, {id: d, driver: driver.driver, opts: {}})
                    }
                    
                    list.appendChild(opt);
                })
                drivers_el.appendChild(list);
            } else {
                let close = line.querySelector('.device-op');
                
                close.title = d.driver().name();
                close.onclick = ev => {
                    this.emit(Events.CLOSE, d);
                }
            }
            
//            line.querySelector('.device-op').onclick = ev => {
//                let dev = this._model.device(ev.target.dataset.value);
//                if(!dev){ 
//                    this.error(`Device '${ev.target.dataset.value}' not found`);
//                    return;
//                }
//                this.emit(Events.OPEN, dev);
//            }
            
            line.querySelector('.device-name').onclick = ev => {
                console.log('usb', device);
//                console.log('options', WebUSB_ID.get_options(device));
            }
            
                        
//            let dtr = line.querySelector('.dtr'),
//                rts = line.querySelector('.rts'),
//                brk = line.querySelector('.brk');
//            
//            function update_button(dtr, rts, brk, signals)
//            {
//                if(!signals){
//                    dtr.disabled = true;
//                    rts.disabled = true;
//                    brk.disabled = true;
//                    
//                    return;  
//                }
//                
//                dtr.disabled = false;
//                rts.disabled = false;
//                brk.disabled = false;
//                
//                if(signals.dtr)
//                    dtr.style.backgroundColor = 'red';
//                else
//                    dtr.style.backgroundColor = 'green';
//                
//                if(signals.rts)
//                    rts.style.backgroundColor = 'red';
//                else
//                    rts.style.backgroundColor = 'green';
//                
//                if(signals.break)
//                    brk.style.backgroundColor = 'red';
//                else
//                    brk.style.backgroundColor = 'green';
//                
//                console.log(signals);
//            }
//            
//            dtr.onclick = () => {
//                let s = d.signals();
//                if(!s) return;
//                
//                d.line_state(!s.dtr, s.rts);
//                update_button(dtr, rts, brk, d.signals());
//            }
//            
//            rts.onclick = () => {
//                let s = d.signals();
//                if(!s) return;
//                
//                d.line_state(s.dtr, !s.rts);
//                update_button(dtr, rts, brk, d.signals());
//            }
//            
//            brk.onclick = () => {
//                let s = d.signals();
//                if(!s) return;
//                
//                d.break(!s.break);
//                update_button(dtr, rts, brk, d.signals());
//            }
//            
//            update_button(dtr, rts, brk, d.signals());
            
            container.appendChild(line);
        });        
    }
    
    error(msg)
    {
        this._container.querySelector('#error').value = msg;
    }
    
    _title(device)
    {
        return (device.productName ? `${device.productName}\n` : '')
                + (device.manufacturerName ? `Manufacturer: ${device.manufacturerName}\n` : '')
                + (device.serialNumber ? `Serial: ${device.serialNumber}\n` : '') 
                + (`Vendor:Product(ID): ${Number(device.vendorId).toString(16)}:${Number(device.productId).toString(16)}
USB Ver: ${device.usbVersionMajor}.${device.usbVersionMinor}.${device.usbVersionSubminor}
Dev Ver: ${device.deviceVersionMajor}.${device.deviceVersionMinor}.${device.deviceVersionSubminor}
Class/Sub/Protocol: ${device.deviceClass}/${device.deviceSubclass}/${device.deviceProtocol}`);
    }
}
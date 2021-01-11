import {Event_Emitter} from '../../../libs/event_emitter.js';
import {Events, Serial_Options, serial_short_form} from './types.js';
import {WebSerial_ID} from './id.js';

import style from './webserial.css';

const filters = [
    {value: 'usbVendorId', label: 'VendorID', title: 'Vendor ID'},
    {value: 'usbProductId', label: 'ProductID', title: 'Product ID'},
//    {value: 'serialNumber', label: 'Serial', title: 'Serial Number'},
//    {value: 'classCode', label: 'Class', title: 'Class Code'},
//    {value: 'subclassCode', label: 'SubClass', title: 'SubClass Code'},
//    {value: 'protocolCode', label: 'Protocol', title: 'Protocol Code'}
];

const template = document.createElement('template');
template.innerHTML = `
<div id=request-container>
    <div id=request-options></div>
    <div>
        <button id=request class='button-request'>Request</button>
        <button id=update class='button-request'>Update</button>
    </div>
</div>
<input-option></input-option>
<closeable-status id=error behaviour=hidden></closeable-status>
<table>
    <tr id=header-line><th id=device-name>Devices</th><th id=device-op>#</th></tr>
    <tbody id=device-container></tbody>
</table>`;

export class WebSerial_View extends Event_Emitter
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
        
        /**
        * Aparently appendChild or cloneNode doesn't work syncronously
        */
        setTimeout(() => {
            let opts = this._container.querySelector('#request-options');
            opts.innerHTML = '';
            filters.forEach(f => {
               opts.innerHTML +=  `<div class=request-opt title='${f.title}'>
                                    <div class=request-label>${f.label}</div>
                                    <input id=${f.value} class=request-input></input>
                                </div>`;
            });

            let serial_opt = this._container.querySelector('input-option');
            serial_opt.add_select('Baudrate', Object.values(Serial_Options.baudrate));
            serial_opt.add_select('Databits', Object.values(Serial_Options.databits));
            serial_opt.add_select('Parity', Object.values(Serial_Options.parity));
            serial_opt.add_select('Stopbits', Object.values(Serial_Options.stopbits));
            serial_opt.add_select('Flowcontrol', Object.values(Serial_Options.flowcontrol), true);

            this._container.querySelector('#request').onclick = ev => {
                this.request_devices();            
            }

            this._container.querySelector('#update').onclick = ev => {
                this.emit(Events.GET);
            }

            this.render_devices();
        }, 0);
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
        
//        if(Object.keys(filter).length > 0)
//            this.emit(Events.REQUEST, filter);
        this.emit(Events.REQUEST, Object.keys(filter).length > 0 ? filter : null);
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
            let line = document.createElement('tr');
            if(d.is_open())
            {
                line.innerHTML = `
<td class=device-name title='${this._title(d)}'>
    <span>${d.name()}(${serial_short_form(d.serial_options(), false)})</span>
    <span class=signals-out>
        <button class='signal dtr'>DTR</button>
        <button class='signal rts'>RTS</button>
        <button class='signal break'>BRK</button>
    </span>
</td>
<td colspan=2 class=device-op data-opened=${d.is_open()}>&times;</td>`;
            } else {
            line.innerHTML = `
<td class=device-name title='${this._title(d)}'>
    <span>${d.name()}</span>
</td>
 <td class=device-op data-opened=${d.is_open()}>&#9658;</td>`;
            }
//            line.innerHTML = `<td class=device-name title='${this._title(d)}'>
//                                <span>${d.name()}</span>
//                            </td>
//                              <td class=device-op data-opened=${d.is_open()}>
//                                ${d.is_open() ? 
//                                        '&times;' : '&#9658;'}
//                            </td>`;
            
            function signal(id, el, str)
            {
                if(id.signals()[str]) el.classList.add('pressed');
                else el.classList.remove('pressed');
                
                el.onclick = ev => {
                    ev.stopPropagation();
                    let target = ev.target;
                    if(id.signals()[str])
                    {
                        let sig = {};
                        sig[str] = false;
                        id.signals(sig);
                        target.classList.remove('pressed');
                    } else {
                        let sig = {};
                        sig[str] = true;
                        id.signals(sig);
                        target.classList.add('pressed');
                    }
                }
            }
            
            if(d.is_open()){
                signal(d, line.querySelector('.dtr'), 'dataTerminalReady');
                signal(d, line.querySelector('.rts'), 'requestToSend');
                signal(d, line.querySelector('.break'), 'break');
            }
            
//            if(d.is_open())
//            {
//                line.querySelector('.dtr');
//                line.querySelector('.dtr').onclick = ev => {
//                    ev.stopPropagation();
//                    if(ev.target.classList.contains('pressed')){
//                        d.device().setSignals({dtr: false})
//                        ev.target.classList.remove('pressed');
//                    } else {
//                        d.device().setSignals({dtr: true})
//                        ev.target.classList.add('pressed');
//                    }
//                }
//            }
            
            line.querySelector('.device-name').onclick = ev => {
                if(d.is_open())
                    d.device().getSignals().then(signals => {
                        console.log('serial', d.device(), d.device().getInfo(), signals);
                    }); 
                else
                        console.log('serial', d.device(), d.device().getInfo());
            }
            
            line.querySelector('.device-op').onclick = ev => {
                let opts = this._container.querySelector('input-option').values();
                this.emit(Events.OPEN, {id: d, opts: {
                    baudRate: parseInt(opts.Baudrate),
                    dataBits: parseInt(opts.Databits),
                    parity: opts.Parity,
                    stopBits: parseInt(opts.Stopbits),
                    flowControl: opts.Flowcontrol
                }});
            }
             
            container.appendChild(line);
        });        
    }
    
    error(msg)
    {
        this._container.querySelector('#error').value = msg;
    }
    
    _title(id)
    {
        return `${id.name()}\nValue: ${id.value()}\nOptions: ${id.is_open() ? serial_short_form(id.serial_options(), true) : '-'}`;
    }
}
import {App_Local_Template} from '../../../core/app/app_template.js';
import {Events} from './types.js';
import {WebSerial_ID} from './id.js';
import {App_List} from '../../app_list.js';
import {Message_Info} from '../../../core/types.js';
import {Control_Type} from '../../../core/libs/message_factory.js';

export class WebSerial_Model extends App_Local_Template
{
    constructor()
    {
        super(App_List.WEBSERIAL.name, App_List.WEBSERIAL.long_name);
        
        this._devices = [];
        
        if(this.support())
        {
            this.update();
        
            navigator.serial.addEventListener("connect", (event) => this.update());
            navigator.serial.addEventListener("disconnect", (event) => this.update());
        }
    }
        
    devices(){ return this._devices; }
    device(value){ return this._devices.find(d => d.value() == value); }
    support(){ return 'serial' in navigator; }
    
    send_data(data, id, to, opt)
    {
        if(typeof data === 'string')
            data = new TextEncoder().encode(data);
        id.write(data);
        return {port: id.name(), data: data};
    }
    
    status()
    {
        let device = [];
        this._devices.forEach(dev => {
            device.push({port: dev.name(), open: dev.is_open()});
        });
        
        this.control(Control_Type.status.value, device);
    }
        
    open(id, opts = {})
    {
        console.assert(id instanceof WebSerial_ID, '"id" must be of instance WebSerial_ID');

        if(id.is_open())
        {
           this.close(id);
        } else {
            id.open(opts).then(() => {
                this.emit(Events.OPEN, id);
                this.emit(Events.ERROR, '');

                this.update_ids(this.devices().filter(device => device.is_open()));

                this.status();
                
                const receive = () => {
                    id.read().then(data => {
                        if(!data) return;
                        this.received_data({port: id.name(), data: data});
                        receive();
                    }).catch(error => {
                        if(error.code != DOMException.ABORT_ERR)
                        { 
                            this.emit(Events.ERROR, error);
                            this.close(id);
                        } else this.emit(Events.ERROR, '');
                    });
                }
                receive();
            }).catch(error => {
                this.emit(Events.ERROR, error);
                this.close(id);
            });
        }
    }
    
    close(dev)
    {
        console.assert(dev instanceof WebSerial_ID, '"dev" must be of instance WebSerial_ID');

        dev.close()
                .finally(() => {
            this.update_ids(this.devices().filter(device => device.is_open()));
            this.update();
        });
    }
    
    request(filters)
    {
//        navigator.serial.requestPort({ filters: [filters] })
        let f = filters ? {filters: [filters]} : {};
        navigator.serial.requestPort(f)
            .then(device => {})
            .catch(error => { 
                this.emit(Events.ERROR, error); 
            }).finally(() => this.update());
    }
    
    update()
    {
        navigator.serial.getPorts()
            .then(devices => {
                this.add(devices);
            }).finally(() => {
                this.status();
            });
    }
        
    add(devices)
    {
        if(!Array.isArray(devices)) devices = [devices];
        
        let old_devs = this._devices;
        this._devices = [];
        devices.forEach(nd => {
            let dev = old_devs.find(d => d.device() === nd);
            dev = dev ? dev : new WebSerial_ID(nd, this);
            this._devices.push(dev);
        });
            
        this.emit(Events.ADD_DEVICE, this._devices);
    }
    
    message_info(type_info, message, opt)
    {
        switch(type_info){
            case Message_Info.ID: 
            case Message_Info.FROM:
                return message.data.port;
            case Message_Info.ID_STRING:
            case Message_Info.FROM_STRING:
                return `${message.data.port}`;
            case Message_Info.DATA_OUTPUT:
                return [message.data.data];
            case Message_Info.DATA_FIELD:
                return 0;
        }
        return null;
    }
    
    _format_control_status(new_message, message)
    {
        message.data.forEach(dev => {
            new_message.data.push(`${dev.port}(${dev.open ? "opened" : "closed"})`);
        });
    }
}
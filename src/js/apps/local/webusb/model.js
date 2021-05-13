import {App_Local_Template} from '../../../core/app/app_template.js';
import {Events} from './types.js';
import {WebUSB_ID} from './id.js';
import {USB_Driver} from './driver/driver_template.js';
import {App_List} from '../../app_list.js';
import {Message_Info} from '../../../core/types.js';
import {Control_Type} from '../../../core/libs/message_factory.js';

export class WebUSB_Model extends App_Local_Template
{
    constructor(server, opt)
    {
        super(App_List.WEBUSB.name, server, App_List.WEBUSB.long_name);
        
        this._devices = [];
        this._drivers = [];
        
        if('drivers' in opt)
            opt.drivers.forEach(d => this.register_driver(d.name, d.driver))
        
        
        if(WebUSB_Model.support())
            this.update();
    }
        
    devices(){ return this._devices; }
    device(value){ return this._devices.find(d => d.value() == value); }
    drivers(){ return this._drivers; }    
    static support(){ return 'usb' in navigator; }
    
    driver(name)
    {
        let f = this._drivers.find(d => d.name === name);
        if(!f) return null;
        
        return f.driver;
    }
    
    register_driver(name, driver)
    {
        console.assert(USB_Driver.isPrototypeOf(driver), '"driver" must be of type USB_Driver');
        console.assert(!this._drivers.find(d => d.name === name), `Driver name "${name}" already registered`);
        
        this._drivers.push({name: name, driver: driver});
        
        return this;
    }
    
    send_data(data, id, to, opt)
    {
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
        
    open(id, driver, opts = {})
    {
        console.assert(id instanceof WebUSB_ID, '"dev" must be of instance WebUSB_ID');
        console.assert(USB_Driver.isPrototypeOf(driver), '"driver" must be of type USB_Driver');
        
        if(id.device().opened)
        {
            this.close(id);
        } else {
            id.open(new driver(id.device()), opts).then(() => {
                this.emit(Events.OPEN, id);
                this.emit(Events.ERROR, '');
                
                this.status();
                
                this.update_ids(this.devices().filter(device => device.is_open()));
                const receive = () => {
                    id.read().then(data => {
                        this.received_data({port: id.name(), data: data});
                        receive()
                    }).catch(error => {
                        if(error.code != DOMException.ABORT_ERR){ /* 20: AbortError: someone asked to close*/
                            this.emit(Events.ERROR, error);
                            this.close(id);
                        } else this.emit(Events.ERROR, '');
                    });
                }
                receive();               
            }).catch(error => {
                this.close(id);
                this.emit(Events.ERROR, error);  
            });
        }
    }
    
    close(dev)
    {
        console.assert(dev instanceof WebUSB_ID, '"dev" must be of instance WebUSB_ID');

        dev.close()
                .finally(() => {
            this.update_ids(this.devices().filter(device => device.is_open()));
            this.update();
        });
    }
    
    request(filters)
    {
        navigator.usb.requestDevice({ filters: [filters] })
            .then(device => {})
            .catch(error => { 
                this.emit(Events.ERROR, error); 
            }).finally(() => this.update());
    }
    
    update()
    {
        navigator.usb.getDevices()
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
            let new_dev = new WebUSB_ID(nd, this);
            
            let dev = old_devs.find(d => d.is_equal(new_dev));
            if(dev) dev.device(nd);
            this._devices.push(dev ? dev : new_dev);
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
//            case Message_Info.IS_SAME_ID:
//            case Message_Info.IS_SAME_ID_EXACTLY:
//                return ;
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
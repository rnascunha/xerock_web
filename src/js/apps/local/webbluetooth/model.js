import {App_Local_Template} from '../../../core/app/app_template.js';
import {Events} from './types.js';
import {WebBluetooth_ID} from './id.js';
import {App_List} from '../../app_list.js';
import {Message_Info} from '../../../core/types.js';
import {Control_Type} from '../../../core/libs/message_factory.js';

export class WebBluetooth_Model extends App_Local_Template
{
    constructor()
    {
        super(App_List.WEBBLUETOOTH.name, App_List.WEBBLUETOOTH.long_name);
        
        this._devices = [];
        
        if(this.support())
        {
            this.update();
        
            navigator.bluetooth.addEventListener("connect", (event) => {
                console.log('connect', event);
                //this.update()
            });
            navigator.bluetooth.addEventListener("disconnect", (event) => {
                console.log('disconnect', event);
                //this.update()
            });
            navigator.bluetooth.addEventListener('availabilitychanged', event => {
                console.log('availabilitychanged', event);
            });
        }
    }
        
    devices(){ return this._devices; }
    device(value){ return this._devices.find(d => d.value() == value); }
    support(){ return 'bluetooth' in navigator; }
    
    send_data(data, id, to, opt)
    {
        if(typeof data === 'string')
            data = new TextEncoder().encode(data);
        id.write(data);
        return {port: id.name(), data: data};
    }
    
    device_by_id(id)
    {
        return this._devices.find(dev => dev.device().id == id);
    }
    
    status()
    {
        let device = [];
        this._devices.forEach(dev => {
            device.push({port: dev.name(), open: dev.is_open()});
        });
        
        this.control(Control_Type.status.value, device);
    }
        
    open(dev)
    {
        console.log('opening', dev);
        console.assert(dev instanceof WebBluetooth_ID, '"id" must be of instance WebBluetooth_ID');

        if(dev.is_open())
        {
            this.emit(Events.ERROR, `Device '${dev.name()}' already open`);
            return;
        }
        
        dev.open().then(server => {
            this.update();
//            console.log('server', server);
//            return server.getPrimaryServices();
        }).then(services => {
//            console.log('services');
//            services.forEach((service,idx) => console.log(idx, service));
        }).catch(error => {
            this.emit(Events.ERROR, error);
//            this.close(dev);
        });
    }
    
    close(dev)
    {
//        console.log('closing', dev);
        console.assert(dev instanceof WebBluetooth_ID, '"dev" must be of instance WebBluetooth_ID');

        dev.close()
                .finally(() => {
            this.update_ids(this.devices().filter(device => device.is_open()));
            this.update();
        });
    }
    
    scan_low_energy(filters = null)
    {
        let f = filters ? {filters: filters} : { acceptAllAdvertisements: true };
        navigator.bluetooth.requestLEScan(f)
            .then(device => {console.log('scan LE', device);})
            .catch(error => { 
                this.emit(Events.ERROR, error); 
            });//.finally(() => this.update());
    }
    
    request(filters)
    {
        let f = filters ? {filters: filters} : { acceptAllDevices: true };
        navigator.bluetooth.requestDevice(f)
            .then(device => {})
            .catch(error => { 
                this.emit(Events.ERROR, error); 
            }).finally(() => this.update());
    }
    
    update()
    {
        navigator.bluetooth.getDevices()
            .then(devices => this.add(devices))
            .finally(() => this.status());
    }
        
    add(devices)
    {
        if(!Array.isArray(devices)) devices = [devices];
        
        let old_devs = this._devices;
        this._devices = [];
        devices.forEach(nd => {
            let dev = old_devs.find(d => d.device() === nd);
            dev = dev ? dev : new WebBluetooth_ID(nd, this);
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

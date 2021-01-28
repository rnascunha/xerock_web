import {App_ID_Template} from '../../../core/id/id_template.js';
import {serial_default} from './types.js';
import {uuidv4} from '../../../helper/uuid.js';

let num = 0;
const prefix = 'bluetooth';

export class WebBluetooth_ID extends App_ID_Template
{    
    constructor(device, app)
    {
        super(device.id, 
              app,
              device.name ? device.name : prefix + (++num));
        
        this._device = device;       
        this._reader = null;
    }
        
    device()
    { 
        return this._device; 
    }
    
    is_open()
    {
        return this._device.gatt.connected;
    }
    
    open()
    { 
        this.device().addEventListener('gattserverdisconnected', ev => {
            this.app().update();
        });
        return this.device().gatt.connect();
    }
    
    async close()
    {           
    
    }
        
    async read()
    {
    
    }

    async write(data)
    {
    
    }
    
    async keep_read()
    {
        
    }
    
    compare_ids(other_id)
    {
        return other_id instanceof App_ID_Template ? 
            this.device() == other_id.device() :
            JSON.stringify(this.value()) == JSON.stringify(other_id);   
    }
}

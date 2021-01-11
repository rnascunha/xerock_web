import {App_ID_Template} from '../../../core/id/id_template.js';
import * as Types from './types.js';
import {USB_Driver} from './driver/driver_template.js';

export class WebUSB_ID extends App_ID_Template
{    
    constructor(device, app, options = {})
    {
        super(`${device.vendorId}:${device.productId}:${device.serialNumber}:${device.deviceClass}:${device.deviceProtocol}`, 
              app, 
              device.productName);
        
        this._device = device;
        this._driver = null;
 
        this._is_open = false;
        this._opts = {};
    }
        
    device(dev = null){ 
        if(dev){
            console.assert(dev instanceof USBDevice, "'dev' must be of type USBDevice");
            this._device = dev;
        }
        return this._device; 
    }
    driver(){ return this._driver; }
    
    open(driver, opts = {})
    {
        console.assert(driver instanceof USB_Driver, '"driver" must be of type USB_Driver');
        
        this._driver = driver;
        
        return this.device().open()
            .then(() => {
                return driver.init(opts);
            }).then(() => {
                new Promise(resolve => { this._is_open = true; this._opts = opts; })
            });
    }
    
    is_open()
    {
        return this._is_open;
    }
    
    close()
    {   
        this._is_open = false;
        this._opts = {};
        
        this._driver = null;
        return this.device().close()
    }
    
    async read()
    {
        return await this.driver().read();
    }

    async write(data)
    {
        await this.driver().write(data);
    }
    
    signals()
    {
        if(this.driver() === null) return null;
        
        return this.driver().signals();
    }
    
    line_state(dtr, rts)
    {   
        this.driver().line_state(dtr, rts);
    }
    
    break(br)
    {   
        if(this.driver() === null) return;
        
        this.driver().break(br);
    }
}

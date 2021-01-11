import {App_ID_Template} from '../../../core/id/id_template.js';
import {serial_default} from './types.js';
import {uuidv4} from '../../../helper/uuid.js';

let port_num = 0;
const port_prefix = 'Port';

export class WebSerial_ID extends App_ID_Template
{    
    constructor(device, app)
    {
        super(uuidv4(), 
              app, 
              `${port_prefix}${++port_num}`);
        
        this._device = device;
 
        this._is_open = false;
        this._opts = {};
        
        this._reader = null;
        
        this._signals = {
            dataTerminalReady: false,
            requestToSend: false,
            break: false
        };
    }
        
    device()
    { 
        return this._device; 
    }
    
    is_open()
    {
        return this._is_open;
    }

    serial_options()
    {
        return Object.assign({}, this._opts);
    }

    async open(opts)
    {
        let op = {...serial_default, ...opts};
        
        await this.device().open(opts)
        await this.signals({dataTerminalReady: false});
        await new Promise(resolve => setTimeout(resolve, 100));
        await this.signals({dataTerminalReady: true});
        this._is_open = true; 
        this._opts = op;
        this._reader = this.device().readable.getReader();
    }
    
    async close()
    {   
        this._is_open = false;
        this._opts = {};
        
        await this._reader.cancel();
        if(this._reader)
            this._reader.releaseLock();
        this._reader = null;
        return this.device().close()
    }
        
    async read()
    {
        if(!this.device().readable)
            throw new DOMException('Readable error', DOMException.NetworkError);
        
        const { value, done } = await this._reader.read();
        if (done) return null;
        
        return value;
    }

    async write(data)
    {
        const writer = this.device().writable.getWriter();
        await writer.write(data);
        writer.releaseLock();
    }
    
    signals(sig = null)
    {
        if(sig !== null)
        {
            this._signals = {...this._signals, ...sig};
            return this.device().setSignals(sig);            
        }
        return Object.assign({}, this._signals);
    }
    
     async keep_read()
    {
        while (this.device().readable) {
            try {
                while (true) {
                    const { value, done } = await this._reader.read();
                    if (done) {
                        // Allow the serial port to be closed later.
                        this._reader.releaseLock();
                        break;
                    }
                    if(value) {
                        console.log('readed', new TextDecoder().decode(value))    ;
                    }
                }
            } catch (error) {
                if(error.code === DOMException.NETWORK_ERR)
                    throw error;
                console.dir(error);
            }
        }
    }
    
    compare_ids(other_id)
    {
        return other_id instanceof App_ID_Template ? 
            this.device() == other_id.device() :
            JSON.stringify(this.value()) == JSON.stringify(other_id);   
    }
}

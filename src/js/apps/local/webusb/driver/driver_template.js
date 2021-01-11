export class USB_Driver
{
    constructor(usb_device, name)
    {
        console.assert(usb_device instanceof USBDevice, '"usb_device" must be of type USBDevice');

        this._device = usb_device;
        this._name = name;    
    }
    
    name(){ return this._name; }
    device(){ return this._device; }
    
    static support(dev)
    {
        console.assert(dev instanceof USBDevice, '"dev" must be of type USBDevice');
        
        return true;
    }
    
    static get_options(dev)
    {
        console.assert(dev instanceof USBDevice, '"dev" must be of type USBDevice');
        
        let opts = [];
        
        dev.configurations.forEach(c => {
            let conf = { value: c.configurationValue, interfaces: [] };
            c.interfaces.forEach(i => {
                let inte = { value: i.interfaceNumber, endpoint_in: null, endpoint_out: null};
                i.alternates[0].endpoints.some(e => {
                    if(e.direction == 'in'){
                        inte.endpoint_in = {value: e.endpointNumber, size: e.packetSize };
                        return true;
                    }
                });
                i.alternates[0].endpoints.some(e => {
                    if(e.direction == 'out'){
                        inte.endpoint_out = {value: e.endpointNumber, size: e.packetSize };
                        return true;
                    }
                });
                conf.interfaces.push(inte);
            });
            opts.push(conf);
        });
        
        return opts;
    }
    
    static default_option(dev)
    {
        console.assert(dev instanceof USBDevice, '"dev" must be of type USBDevice');
        
        let opt = USB_Driver.get_options(dev);
        
        return { 
            configuration: opt[0].value,
            interface: opt[0].interfaces[0].value,
            ep_in: opt[0].interfaces[0].endpoint_in,
            ep_out: opt[0].interfaces[0].endpoint_out
        }
    }
}

export class USB_Serial_Driver extends USB_Driver
{
    constructor(device, name, options = {})
    {    
        super(device, name);
        
        let opts = {...USB_Driver.default_option(device), ...options};
        
        this._config = opts.configuration;
        this._interface = opts.interface;
        this._ep_in = opts.ep_in;
        this._ep_out = opts.ep_out;
        
        this._flow_control = {
            dtr: false,
            rts: false,
            break: false
        }
    }
        
    open(options)
    {
        console.warn('"init" method must me overriden. It must return a promise');
    }
    
    line_state(dtr, rts)
    {
        this._flow_control.dtr = dtr;
        this._flow_control.rts = rts;
        
        if(!this.device().opened) return;
        
        return this._set_line_state();
    }
    
    break(br)
    {
        this._flow_control.break = br;
        
        if(!this.device().opened) return;
        
        return this._set_break();
    }
    
    _set_line_state()
    {
        console.warn('"_set_line_state" method must be overriden');
    }
    
    _set_break()
    {
        console.warn('"_set_break" method must be overriden');
    }
    
    signals()
    {
        return this._flow_control;
    }
    
    async read()
    {
        if(!this.device().opened) return null;
        
        const r = await this.device().transferIn(this._ep_in.value, this._ep_in.size);
        return new Uint8Array(r.data.buffer)
    }

    async write(data)
    {
        if(!this.device().opened) return null;
        
        if(typeof data === 'string')
            data = new TextEncoder().encode(data);
        
        do{
            let send_data = data.slice(0, this._ep_out.size);
            await this.device().transferOut(this._ep_out.value, data);
            data = data.slice(this._ep_out.size);
        }while(data.length);
    }
}
import {USB_Serial_Driver} from './driver_template.js';

//https://cscott.net/usb_dev/data/devclass/usbcdc11.pdf

const driver_name = 'USB_CDC_ACM';
const control_interface_class = 2;
const transfer_interface_class = 10;

const request = {
    set_line_coding: 0x20,
    get_line_coding: 0x21,
    set_control_line_state: 0x22,
    send_break: 0x23
}

const serial_default = {
  baudrate: 115200,
  databits: 8,
  stopbit: 1,
  parity: 'none',
}

const databits = {
    '5': {value: 5, name: '5'},
    '6': {value: 6, name: '6'},
    '7': {value: 7, name: '7'},
    '8': {value: 8, name: '8', default: true},
    '16': {value: 16, name: '16'}
}

const parity = {
    none: {value: 0, name: 'none', default: true},
    odd: {value: 1, name: 'odd'},
    even: {value: 2, name: 'even'},
    mark: {value: 3, name: 'mark'},
    space: {value: 4, name: 'space'}
}

const stopbits = {
    '1': {value: 0, name: '1'},
//    '1.5': {value: 1, name: '1.5'}, //Not valid to webusb
    '2': {value: 2, name: '2'}
}

function get_value(key, object, backup)
{
    if(!(key in object)){
        console.warn(`Value ${key} not support. Using default value ${object[backup].name}`, object);
        return object[backup].value;
    }
    
    return object[key].value;
}

export class USB_CDC extends USB_Serial_Driver
{
    constructor(usb_driver, options = {})
    {
        super(usb_driver, driver_name);
    }
    
    init(opts = {})
    {
        let options = {...serial_default, ...opts};
        
        return this.device().selectConfiguration(this._config)
            .then(() => {
                return this.device().claimInterface(this._interface)
            }).then(() => {
                // Ref: USB CDC specification version 1.1 §6.2.12.
                const buffer = new ArrayBuffer(7);
                const view = new DataView(buffer);
                    view.setUint32(0, options.baudrate, true);
                    view.setUint8(4, get_value(options.stopbit, stopbits, serial_default.stopbit));
                    view.setUint8(5, get_value(options.parity, parity, serial_default.parity));
                    view.setUint8(6, get_value(options.databits, databits, serial_default.databits));

                return this.device().controlTransferOut({
                        requestType: 'class',
                        recipient: 'interface',
                        request: request.set_line_coding,
                        value: 0x00,
                        index: this._interface,
                    }, buffer);
            })
            .then(() => {
                return this.line_state(this.signals().dtr, this.signals().rts);
            })
            .then(() => {
                return this.break(this.signals().break);
            });
    }
    
    _set_line_state()
    {        
        return this.device().controlTransferOut(
            {
                requestType: 'class',
                recipient: 'interface',
                request: request.set_control_line_state,
                value: (this._flow_control.dtr ? 0x0001 << 0 : 0) | 
                        (this._flow_control.rts ? 0x0001 << 1 : 0),
                index: this._interface
            }
        );
    }
    
    _set_break()
    {                
        return this.device().controlTransferOut(
            {
                requestType: 'class',
                recipient: 'interface',
                request: request.send_break,
                value: this._flow_control.brk ? 0xFFFF : 0x0000,
                index: this._interface
              }
        );
    }
}

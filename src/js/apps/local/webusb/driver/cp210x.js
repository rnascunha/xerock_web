import {USB_Serial_Driver} from './driver_template.js';

//https://cscott.net/usb_dev/data/devclass/usbcdc11.pdf

const driver_name = 'CP210x';

const request = {
    interface_enable: 0x00,
    set_bauddiv: 0x01,
    set_line_coding: 0x03,
    get_line_coding: 0x04,
    set_control_line_state: 0x07,
    send_break: 0x05
}

const serial_default = {
  baudrate: 9600,
  databits: 8,
  stopbit: 1,
  parity: 'none',
}

const databits = {
    '5': {value: 5, name: '5'},
    '6': {value: 6, name: '6'},
    '7': {value: 7, name: '7'},
    '8': {value: 8, name: '8', default: true},
//    '16': {value: 16, name: '16'}
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

export class CP210x_Driver extends USB_Serial_Driver
{
    constructor(device, id)
    {
        super(device, driver_name);
    }
    
    init(opts = {})
    {
        let options = {...serial_default, ...opts};
        
        return this.device().selectConfiguration(this._config)
            .then(() => {
                return this.device().claimInterface(this._interface);
            }).then(() => {
                return this.device().controlTransferOut(
                    {
                        requestType: 'vendor',
                        recipient: 'device',
                        request: request.interface_enable,
                        index: this._interface,
                        value: 0x01
                    }
                )
            }).then(() => {
                return this.line_state(this.signals().dtr, this.signals().rts);
            }).then(() => {
                return this.break(this.signals().break);
            }).then(() => {
                return this.device().controlTransferOut(
                    {
                        requestType: 'vendor',
                        recipient: 'device',
                        request: request.set_line_coding,
                        index: this._interface,
                        value: get_value(options.stopbit, stopbits, serial_default.stopbit) | 
                                get_value(options.parity, parity, serial_default.parity) << 4 |
                                get_value(options.databits, databits, serial_default.databits) << 8
                    })
            }).then(() => {
                return this.device().controlTransferOut(
                    {
                        requestType: 'vendor',
                        recipient: 'device',
                        request: request.set_bauddiv,
                        index: this._interface,
                        value: 0x384000 / options.baudrate
                    })
            });
    }
        
    _set_line_state(dtr, rts)
    {        
        return this.device().controlTransferOut(
            {
                requestType: 'vendor',
                recipient: 'device',
                request: request.set_control_line_state,
                index: this._interface,
                value: 0x0300 | //mask
                        dtr ? (1 << 0) : 0 | 
                        rts ? (1 << 1) : 0
            }
        );
    }
    
    _set_break(br)
    {        
        return this.device().controlTransferOut(
            {
                requestType: 'vendor',
                recipient: 'device',
                request: request.send_break,
                value: br ? 0x0001 : 0x0000,
                index: this._interface
              }
        );
    }
}

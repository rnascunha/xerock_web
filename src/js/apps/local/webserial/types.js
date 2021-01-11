
export const Events = {
    REQUEST: Symbol('request'),
    GET: Symbol('get'),
    ADD_DEVICE: Symbol('add device'),
    ERROR: Symbol('error'),
    OPEN: Symbol('open'),
    CLOSE: Symbol('close')
}

//https://reillyeon.github.io/serial/#serialoptions-dictionary
//Baudrate should be any positive interger... should.
export const Serial_Options = {
    baudrate: {
        50: {value: 50, name: '50'},
        75: {value: 75, name: '75'},
        110: {value: 100, name: '110'},
        134: {value: 134, name: '134'},
        150: {value: 150, name: '150'},
        200: {value: 200, name: '200'},
        300: {value: 300, name: '300'},
        600: {value: 600, name: '600'},
        1200: {value: 1200, name: '1200'},
        1800: {value: 1800, name: '1800'},
        2400: {value: 2400, name: '2400'},
        4800: {value: 4800, name: '4800'},
        9600: {value: 9600, name: '9600'},
        19200: {value: 19200, name: '19200'},
        38400: {value: 38400, name: '38400'},
        57600: {value: 57600, name: '57600'},
        115200: {value: 115200, name: '115200', default: true},
    },
    databits: {
        '7': {value: 7, name: '7'},
        '8': {value: 8, name: '8', default: true},
    },
    parity: {
        none: {value: 'none', name: 'none', default: true},
        even: {value: 'even', name: 'even'},
        odd: {value: 'odd', name: 'odd'},
    },
    stopbits: {
        none: {value: 1, name: '1', default: true},
        hardware: {value: 2, name: '2'}
    },
    flowcontrol: {
        none: {value: 'none', name: 'none', default: true},
        hardware: {value: 'hardware', name: 'hardware'}
    }
}

export const serial_default = {
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 2,
    flowControl: 'none'
}

export function serial_short_form(opts, fc = false)
{
    let m = `${opts.baudRate} ${opts.dataBits}${opts.parity[0].toUpperCase()}${opts.stopBits}`;
    return fc ?  m + ` ${opts.flowControl}` : m;
}
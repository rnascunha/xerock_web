export const Serial_Events = {
    STATUS: 'serial status',
    OPEN: 'serial port open',
    CLOSE: 'serial port close',
    CONFIG: 'serial config',
    ERROR: 'serial error'
};
Object.freeze(Serial_Events);

export const Serial_Baudrate = {
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
}
Object.freeze(Serial_Baudrate);

export const Serial_Bytesize = {
    5: {value: 5, name: '5'},
    6: {value: 6, name: '6'},
    7: {value: 7, name: '7'},
    8: {value: 8, name: '8', default: true},
}
Object.freeze(Serial_Bytesize);

export const Serial_Parity = {
    none: {value: 0, name: 'None', short: 'N', default: true},
    odd: {value: 1, name: 'Odd', short: 'O'},
    even: {value: 2, name: 'Even', short: 'E'},
//    mark: {value: 'mark', name: 'Mark', short: 'M'},
//    space: {value: 'space', name: 'Space', short: 'S'}
}
Object.freeze(Serial_Parity);

export const Serial_Stopbit = {
    1: {value: 0, name: '1', short: '1'},
    15: {value: 1, name: '1.5', short: '1.5'},
    2: {value: 2, name: '2', short: '2'}
}
Object.freeze(Serial_Stopbit);

export const Serial_Flow_Control = {
    none: {value: 0, name: 'None', short: 'none'},
    hw: {value: 2, name: 'Hardware', short: 'hw'},
    sw: {value: 1, name: 'Software', short: 'sw'},
//    hw_sw: {value: 'hw_sw', name: 'Hardware/Software', short: 'hw_sw'}
}
Object.freeze(Serial_Flow_Control);

export const serial_fc_start = 0x11, serial_fc_stop = 0x13;

export function register_types(el, obj){
    Object.keys(obj).forEach(key => {
       let op = document.createElement('option');
        op.value = obj[key].value;
        op.textContent = obj[key].name;
        if(obj[key].hasOwnProperty('default'))
            op.selected = obj[key].default;
        
        el.appendChild(op);
    });
}

export const serial_html_template = document.createElement('template');
serial_html_template.innerHTML = `
<div id=options>
    <div class=field>
        <span class=label>Baudrate</span>
        <input id=baudrate list=baudrates style=width:11ch>
        <datalist id=baudrates></datalist>
        <!--<select id=baudrate></select>-->
    </div>
    <div class=field>
        <span class=label>Byte Size</span><select id=bytesize></select>
    </div>
    <div class=field>
        <span class=label>Parity</span><select id=parity></select>
    </div>
    <div class=field>
        <span class=label>Stopbit</span><select id=stopbit></select>
    </div>
    <div class=field>
        <span class=label>Flow Control</span><select id=flowcontrol></select>
    </div>
    <div class='field flowcontrol-args'>
        <span class=label>Start</span><input class=flowcontrol id=flowcontrol-start></input>
    </div>
    <div class='field flowcontrol-args'>
        <span class=label>Stop</span><input class=flowcontrol id=flowcontrol-stop></input>
    </div>
</div>
<closeable-status id=error behaviour=hidden></closeable-status>
<button id=update-button>Update</button>
<table id=table-ports>
    <thead id=thead-ports>
       <tr><th id=cell-port-name>Port</th><th id=conn-button-head>#</th></tr>
    </thead>
    <tbody id=tbody-ports>
        <tr><td colspan=3 style="text-align: center">No read</td></tr>
    </tbody>
</table>`;

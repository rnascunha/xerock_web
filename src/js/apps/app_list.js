import {Custom_Paint_Type} from '../core/types.js';

export const App_List = {
    MAIN: { name: 'main', long_name: 'Main', 
        options: {
            container: false, 
            color: '#ffffee', 
            paint_types: [Custom_Paint_Type.CONFIG_RECEIVED,Custom_Paint_Type.CONFIG_SEND]
        }
    },
    ECHO: { name: 'echo', long_name: 'Echo',
        options: {
            container: false, 
            color: '#fc0', 
            paint_types: [Custom_Paint_Type.RECEIVED, Custom_Paint_Type.SENT]
        }
    },
    SERIAL: { name: 'serial', long_name: 'Serial', options: { color: '#ccbbbb' }},
    MONITOR: { name: 'monitor', long_name: 'Monitor', options: {color: '#00ffff'}},
    TCP_SERVER: { name: 'tcp_server', long_name: 'TCP Server', options: {color: '#eeccbb'}},
    TCP_CLIENT: { name: 'tcp_client', long_name: 'TCP Client', options: {color: '#aacc33'}},
    WEBUSB: { name: 'webusb', long_name: 'WebUSB', options: {color: '#aa0000'}},
    WEBSERIAL: { name: 'webserial', long_name: 'WebSerial', options: {color: '#bbbb00'}},
    WEBSOCKET_CLIENT: { name: 'websocket_client', long_name: 'WebSocket Client', options: {color: '#00cccc'}},
    GEOLOCATION: { name: 'geolocation', long_name: 'Geolocation', options: {color: '#bbccbb'}},
    ORIENTATION: { name: 'orientation', long_name: 'Orientation & Motion', options: {color: '#ccaaaa'}}
}
Object.freeze(App_List);
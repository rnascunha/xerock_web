//import {make_app_dispatcher as make_default} from './core/make_default.js';
import {make_app_dispatcher as make_grid} from './core/make_grid.js';
import {App_List} from './apps/app_list.js';
import {Custom_Paint_Type} from './core/types.js';

//Apps
import {Echo_App} from './apps/echo/echo_app.js';
import {Serial_App} from './apps/serial/controller.js';
import {Monitor_App} from './apps/monitor/controller.js';
import {TCP_Server_App} from './apps/tcp_server/controller.js';
import {TCP_Client_App} from './apps/tcp_client/controller.js';
import {UDP_Client_App} from './apps/udp_client/controller.js';
//Local Apps
import {WebUSB_App} from './apps/local/webusb/controller.js';
import {WebSerial_App} from './apps/local/webserial/controller.js';
import {WebSocket_Client_App} from './apps/local/websocket_client/controller.js';
import {GeoLocation_App} from './apps/local/geolocation/controller.js';
import {Orientation_App} from './apps/local/orientation/controller.js';
//import {WebBluetooth_App} from './apps/local/webbluetooth/controller.js';
//Commands
import {Input_ESP32_BR} from './modules/input/esp32_br_input.js';
import {Input_Ebyte_Radio} from './modules/input/ebyte_input.js';
import {Custom_Input} from './modules/input/custom_input.js';
import {Input_JSON_Message} from './modules/input/json_message.js';
//Views
import {Terminal_View} from './modules/view/terminal.js';
import {Data_Compare_View} from './modules/view/data_compare/data_compare.js';
//Scripts
import {Send_Message_Script} from './modules/script/send_message.js';
import {Echo_Script} from './modules/script/echo.js';
import {Bridge_Script} from './modules/script/bridge.js';
import {ESP32_Mesh_Script} from './modules/script/esp32_mesh/esp32_mesh.js';
//WebUSB drivers
import {USB_CDC} from './apps/local/webusb/driver/usb_cdc.js';
import {CP210x_Driver} from './apps/local/webusb/driver/cp210x.js';

//Tools
import {Tools} from './extra/tools.js';

import {Data_Converter_Tool} from './modules/tool/data_converter.js';
import {Filter_Tester_Tool} from './modules/tool/filter_tester.js';
import {Data_Viewer_Tool} from './modules/tool/data_viewer.js';

if ('serviceWorker' in navigator)
{
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(`${publicPath}service-worker.js`).then(registration => {
//            console.log('SW registered: ', registration, publicPath);
        }).catch(registrationError => {
            console.error('SW registration failed: ', registrationError);
        });
    });
}

const app = make_grid(document.body, {app_custom_paint: true});

app.register_app(App_List.ECHO.name, Echo_App, App_List.ECHO.options);
app.register_app(App_List.SERIAL.name, Serial_App, App_List.SERIAL.options);
app.register_app(App_List.MONITOR.name, Monitor_App, App_List.MONITOR.options);
app.register_app(App_List.TCP_SERVER.name, TCP_Server_App, App_List.TCP_SERVER.options);
app.register_app(App_List.TCP_CLIENT.name, TCP_Client_App, App_List.TCP_CLIENT.options);
app.register_app(App_List.UDP_CLIENT.name, UDP_Client_App, App_List.UDP_CLIENT.options);

app.register_local_app(WebUSB_App, {...App_List.WEBUSB.options, 
                                        drivers: [
                                            {name: 'USB_CDC', driver: USB_CDC}, 
                                            {name: 'CP201x', driver: CP210x_Driver}
                                        ]
});
app.register_local_app(WebSerial_App, App_List.WEBSERIAL.options);
app.register_local_app(WebSocket_Client_App, App_List.WEBSOCKET_CLIENT.options);
app.register_local_app(GeoLocation_App, App_List.GEOLOCATION.options);
app.register_local_app(Orientation_App, App_List.ORIENTATION.options);

app.register_command(new Input_ESP32_BR());
app.register_command(new Input_Ebyte_Radio());
app.register_command(new Custom_Input());
app.register_command(new Input_JSON_Message());

app.register_script(new Send_Message_Script('Send Message'));
app.register_script(new Echo_Script('Echo Message'));
app.register_script(new Bridge_Script('Bridge Messages'));
app.register_script(new ESP32_Mesh_Script('ESP32 Mesh'));

app.register_view('Terminal', Terminal_View);
app.register_view('Data Compare', Data_Compare_View);

const tools = new Tools(document.querySelector('#tools-menu'));
tools.register(new Data_Viewer_Tool());
tools.register(new Data_Converter_Tool());
tools.register(new Filter_Tester_Tool());

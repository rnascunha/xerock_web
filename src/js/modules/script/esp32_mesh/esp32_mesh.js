import {Script_Template} from '../../../core/script_executor/script_template.js';
import {Script_Events, Script_Errors} from '../../../core/script_executor/types.js';
import {ESP32_Mesh_Script_View} from './view.js';
import {Mesh_System, Wifi_Router_List, Mesh_Net_List, Mesh_Device_List, BR_Device} from './mesh_system.js';
import {ESP32_Events} from './types.js';
import {Message_Type, Message_Direction, get_message_data} from '../../../core/libs/message_factory.js';
import {BR_Command_Type, Node_Command_Type} from '../../../components/esp32_br_input/type.js';
import {BR_Message, Node_Message} from './mesh_messages.js';
import {Input_Type} from '../../../core/input/types.js';
import {Message_Info} from '../../../core/types.js';
import {Mesh_Info} from './types.js';
import {Register_ID} from '../../../core/id/controller.js';
import {App_ID_Template} from '../../../core/id/id_template.js';

const default_node_version = 0;
const default_br_version = 0;

const send_interval = 50; //ms
const send_limit_count = 2;

export class ESP32_Mesh_Script extends Script_Template
{
    constructor(name)
    {
        super(name);

        this._view = new ESP32_Mesh_Script_View(this);
        this._view.on(ESP32_Events.SEND_MESSAGE, arg => this.send(arg.data, arg.to));
        
        this._input_id = new Register_ID(this._view.element().querySelector('#esp32-mesh-id'), 
                                                                {include_only_app: 'tcp_server'});
        this.on(Script_Events.CHECK_IDS, list => {
            this._input_id.check_ids(list);
            this._update_id(list);
            this._set_clients_list();
        });
        
        this.on(Script_Events.RECEIVED_MESSAGE, message => this._on_message(message));
        
        this._test_num = 0;
        this._br_clients = [];
            
        this.id = null;
        
        this._system = new Mesh_System();
        
        this.last_send = {};
    }
        
    element()
    {
        return this._view.element();
    }
    
    enable(en)
    {
        this.id = null;
        
        this.emit(ESP32_Events.ENABLE, en);
    }
    
    run()
    {
        this.id = this._input_id.selected();
        if(!this.id)
        {
            this.cancel(Script_Errors.NO_INPUT);
            return false;
        }
        
        this.monitor_ids(this.id);        
        this._set_clients_list();
        
        return this._run_script();
    }
    
    async _run_script()
    {
        while(!this.is_cancelled())
        {
            await this._check_devices_data();
            await this.delay(60 * 1000);    //Each minute
        }
        
        return this.reason() == 'button cancelled' ? true : false;
    }
    
    auto_message()
    {
        return this._view.auto_message();
    }
        
    _on_message(message)
    {
        if(!this.id.filter_message(message, this._view.compare_types_check(), {"dir": [Message_Direction.received.value], 
                                                                            "type": [Message_Type.data.value]}))
            return;
        
        let from = message.from,
            input = get_message_data(message);/*typeof message.data.data == 'string' ? message.data.data : 
                                    (message.data.data instanceof Array ? 
                                        new Uint8Array(message.data.data) : message.data.data);*/
        
        let parsed_arr = this._mesh_data_handler(from, input, message);
                
        parsed_arr.forEach(parsed => {
            if(parsed.error) return;
            this._process_data(parsed, from);
            this.emit(ESP32_Events.RENDER_MESSAGES, {data: parsed, from: from, input: input, message: message});
        });
        
        this.emit(ESP32_Events.RENDER_DEVICES);
        this.emit(ESP32_Events.RENDER_NET);
        this.emit(ESP32_Events.RENDER_ROUTERS);
    }
    
    _process_data(data, from)
    {     
        this._system.add(data.data, from);
        this._check_devices_data();
    }
    
    _mesh_data_handler(from, data, message)
    {
        this.emit(ESP32_Events.ERROR, '');
        let p_message = BR_Message.parser(data);
        if(p_message.error) this.emit(ESP32_Events.ERROR, p_message.message_err);
        return p_message;
    }
       
    _send_br_command(to, type, ver = default_br_version)
    {
        this.send(new Uint8Array(BR_Message.make_message(ver, type)), to);
    }
    
    _send_node_command(mac, type, ver = default_node_version)
    {
        let br = this._system.br_by_mac(mac);
        if(br)
            this.send(new Uint8Array(Node_Message.make_message(ver, type, mac)), br.to());
        else
            this.emit(ESP32_Events.ERROR, 'BR not found');
    }
    
    /**
    * Lógica de envio criada devido ao dispositivo 
    * border router não suportar o recebimento de diversas
    * mesangens contiguas (porque?).
    */    
    send(data, to)
    {    
        if(!this.id || this.is_cancelled()) return;
        
        let to_str = JSON.stringify(to);
        
        if(this.last_send[to_str] && 
           this.last_send[to_str].time + send_interval <= Date.now())
            delete this.last_send[to_str];
        
        if(!this.last_send[to_str])
        {
            this.id.send(data, to, {data_type: Input_Type.hex.value});
            this.last_send[to_str] = {time: Date.now(), count: 1};
            return;
        }
        
        if(this.last_send[to_str].count++ < send_limit_count)
        {
            this.id.send(data, to, {data_type: Input_Type.hex.value});
            this.last_send[to_str].time = Date.now();
            return;
        }
        
        setTimeout(this.send.bind(this), send_interval, data, to);
    }
    
    _update_id(list)
    {
        if(!this.id || this.is_cancelled()) return;
        
        let check = this.id.is_at_list(list);
        if(check instanceof App_ID_Template)
            this.id = check;
//        new_ids.ids.some(id => {
//            if(id.is_equal(this.id)){
//                this.id = id;
//                return true;
//            }
//        });
    }
    
    _set_clients_list()
    {
        if(!this.id || this.is_cancelled()) return;
    
        this._br_clients = this.id.clients();
        
        this.emit(ESP32_Events.RENDER_BR_CLIENTS);
        
        if(this.auto_message()){
            this._br_clients.forEach(br => {
                this._send_br_command({addr: br.addr(), port: br.port()}, BR_Command_Type.FULL_CONFIG, default_br_version)
            });
        }
        
        this._system.check_border_router(this._br_clients);
        this.emit(ESP32_Events.RENDER_NET);
    }
    
    async _check_devices_data()
    {
        if(!this.auto_message()) return;
        
        const check_min_time = 60 * 60 * 1000; //1hour at miliseconds
        let count = 0;
        this._system.device().forEach(dev => {
            if((Date.now() - dev.updated()) > check_min_time 
               && (Date.now() - dev.sended()) > check_min_time)
           {
                dev.sended(Date.now());
                this._send_node_command(dev.mac(), Node_Command_Type.FULL_CONFIG, default_node_version); 
           }
        });
    }
}

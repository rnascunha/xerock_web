import {BR_Command_Type, Node_Command_Type, 
        Node_Message_Type} from '../../../components/esp32_br_input/type.js';
import {Node_Command_Type_Response} from './types.js';
import {Struct} from '../../../libs/struct.js';
import {Byte_Array} from '../../../libs/byte_array/byte_array.js';
import {Data_Type} from '../../../libs/byte_array/types.js';
import {Mesh_Info} from './types.js';

export function _set_error(msg, message_err = '')
{
    msg.error = true;
    msg.message_err = message_err;
}

export class BR_Message
{
    static parser(data)
    {
        let temp = Struct.make([{data_type: Data_Type.uint8.value, name: Mesh_Info.BR_VERSION}], data);
        if(temp.error == true) return temp;
        
        switch(+temp.data.br_version)
        {
            case 0:
                return BR_Message0.parser(temp);
            default:
                _set_error(temp, 'Wrong BR version [' + temp.br_version + ']');
        }
        temp.error = true;
        
        return [temp];
    }
    
    static make_message(ver, type)
    {
        switch(type)
        {
            case BR_Command_Type.CONFIG:
                return BR_Message.config(ver);
            case BR_Command_Type.STATUS:
                return BR_Message.status(ver);
            case BR_Command_Type.ROUTE_TABLE:
                return BR_Message.route_table(ver);
            case BR_Command_Type.FULL_CONFIG:
                return BR_Message.full_config(ver);
            case BR_Command_Type.REBOOT:
                return BR_Message.reboot(ver);
            case BR_Command_Type.WAIVE_ROOT:
                return BR_Message.waive_root(ver);
        }
    }
    
    static route_table(ver)
    {
        return BR_Message0.route_table();
    }
    
    static config(ver)
    {
        return BR_Message0.config();
    }
    
    static status(ver)
    {
        return BR_Message0.status();
    }
    
    static full_config(ver)
    {
        return BR_Message0.full_config();
    }
    
    static reboot(ver)
    {
        return BR_Message0.reboot();
    }
    
    static waive_root(ver)
    {
        return BR_Message0.waive_root();
    }
}

export class BR_Message0
{
    static parser(data)
    {        
        let message_arr = [];
        let temp;
        parser_message_loop:
        while(true){
            temp = Struct.make([{data_type: Data_Type.hex.value, name: Mesh_Info.ADDR, size: 6, opt: {aggregate: 1, sep: ':'}},
                                    {data_type: Data_Type.uint16le.value, name: Mesh_Info.BR_SIZE},
                                    {data_type: Data_Type.uint8.value, name: Mesh_Info.NODE_VERSION}], data.rest, data.data);
            if(temp.error == true){
                message_arr.push(temp);
                break;
            }
            
            if(+temp.data[Mesh_Info.BR_SIZE] > temp.rest.length + 1)
            {
                temp.error = true;
                temp.message_err = 'Payload too small';
                console.error(temp);
            
                message_arr.push(temp);
                break;
            }

            let new_message;
            switch(+temp.data.node_version)
            {
                case 0:
                    new_message = Node_Message0.parser(temp);
                    break;
                default:
                    _set_error(temp, 'Wrong node version [' + temp.data.node_version + ']');
                    break parser_message_loop;
            }

            message_arr.push(new_message);
            if(new_message.error == true) break;
            
            if(new_message.rest.length == 0)
                break;
            
            data = {
                data: {
                    br_version: data.data.br_version
                },
                rest: new_message.rest.slice(1)
            }
        }
        return message_arr;
    }
    
    static route_table()
    {
        return [0x00, 0x01, 0x01, 0x00, 0x00];
    }
    
    static config()
    {
        return [0x00, 0x01, 0x01, 0x00, 0x01];
    }
    
    static status()
    {
        return [0x00, 0x01, 0x01, 0x00, 0x02];
    }
    
    static full_config()
    {
        return [0x00, 0x01, 0x01, 0x00, 0x03];
    }
    
    static reboot()
    {
        return [0x00, 0x01, 0x01, 0x00, 0x04];
    }
    
    static waive_root()
    {
        return [0x00, 0x01, 0x01, 0x00, 0x05];
    }
}

export class Node_Message
{
    static make_message(ver, type, mac)
    {
        switch(type){
            case Node_Command_Type.CONFIG:
                return Node_Message.config(ver, mac);
            case Node_Command_Type.STATUS:
                return Node_Message.status(ver, mac);
            case Node_Command_Type.ROUTE_TABLE:
                return Node_Message.route_table(ver, mac);
            case Node_Command_Type.FULL_CONFIG:
                return Node_Message.full_config(ver, mac);
            case Node_Command_Type.REBOOT:
                return Node_Message.reboot(ver, mac);
        }
    }
    
    static _to_data_array(mac, before = '', after = '')
    {
        let dc = new Byte_Array();
        dc.from(`${before}${mac}${after}`.replace(/[^0-9a-fA-F]/g, ''), Data_Type.hex.value);
        return dc.raw();
    }
    
    static config(ver, mac)
    {
        return Node_Message0.config(mac);
    }
    
    static status(ver, mac)
    {
        return Node_Message0.status(mac);
    }
    
    static full_config(ver, mac)
    {
        return Node_Message0.full_config(mac);
    }
    
    static route_table(ver, mac)
    {
        return Node_Message0.route_table(mac);
    }
    
    static reboot(ver, mac)
    {
        return Node_Message0.reboot(mac);
    }
}

export class Node_Message0
{   
    static parser(data)
    {
        let temp = Struct.make([{data_type: Data_Type.uint8.value, name: Mesh_Info.MESSAGE_TYPE},
                                 {data_type: Data_Type.uint16le.value, name: Mesh_Info.NODE_SIZE}], data.rest, data.data);
        if(temp.error == true) return temp;
        
        switch(+temp.data.message_type)
        {
            case Node_Message_Type.DATA:
                temp.data[Mesh_Info.MESSAGE_TYPE_NAME] = 'DATA';
                return Node_Message0._parse_node_data(temp);
                return temp;
                break;
            case Node_Message_Type.COMMAND:
                temp.data[Mesh_Info.MESSAGE_TYPE_NAME] = 'COMMAND';
                return Node_Message0._parse_node_command(temp);
                break;
            default:
                _set_error(temp, 'Message type node defined [' + temp.data.message_type + ']');
        }
        return temp;
    }
     
    static config(mac)
    {
        return Node_Message._to_data_array(mac, '0000 0b00', '0001 0100 01');
    }
    
    static status(mac)
    {
        return Node_Message._to_data_array(mac, '0000 0b00', '0001 0100 02');
    }
    
    static full_config(mac)
    {
        return Node_Message._to_data_array(mac, '0000 0b00', '0001 0100 03');
    }
    
    static route_table(mac)
    {
        return Node_Message._to_data_array(mac, '0000 0b00', '0001 0100 00');
    }
    
    static reboot(mac)
    {
        return Node_Message._to_data_array(mac, '0000 0b00', '0001 0100 04');
    }
    
    static _parse_router_table(data)
    {
        let temp = Struct.make([{data_type: Data_Type.uint8.value, name: Mesh_Info.LAYER},
                                {data_type: Data_Type.hex.value, name: Mesh_Info.PARENT, size: 6, opt: {aggregate: 1, sep: ':'}}],
                                data.rest, data.data);
                
        if((+temp.data.node_size - 8) % 6 != 0)
        {
            _set_error(temp, 'Message command router_table size error [' + data.data.node_size + ']');
            return temp;
        }
        
        let num_tables = (+temp.data.node_size - 8) / 6,
            dc = new Byte_Array();
        temp.data[Mesh_Info.CHILDREN] = [];
        for(let i = 0; i < num_tables; i++)
        {
            dc.raw(temp.rest.slice(0, 6));
            temp.data[Mesh_Info.CHILDREN].push(dc.hex({aggregate: 1, sep: ':'}));
            temp.rest = temp.rest.slice(6);
        }
        
        return temp;
    }
    
    static _parse_config(data)
    {
        let temp = Struct.make([{data_type: Data_Type.hex.value, name: Mesh_Info.MAC_AP, size: 6, opt: {aggregate: 1, sep: ':'}},
                                {data_type: Data_Type.hex.value, name: Mesh_Info.MESH_ID, size: 6, opt: {aggregate: 1, sep: ':'}},
                                {data_type: Data_Type.uint8.value, name: Mesh_Info.IS_ROOT},
                                {data_type: Data_Type.uint8.value, name: 'channel'}],
                                data.rest, data.data);
        if(temp.error == true)
            return temp;
        
        temp.data[Mesh_Info.CH_CONN] = (temp.data.channel & 0xf0) >> 4;
        temp.data[Mesh_Info.CH_CONFIG] = (temp.data.channel & 0x0f);
        
        return temp;        
    }
    
    static _parse_status(data)
    {
        let temp = Struct.make([{data_type: Data_Type.int8.value, name: Mesh_Info.RSSI}], data.rest, data.data);
        
        return temp;
    }
    
    static _parse_full_config(data)
    {
        let temp = Struct.make([{data_type: Data_Type.hex.value, name: Mesh_Info.MAC_AP, size: 6, opt: {aggregate: 1, sep: ':'}},
                                {data_type: Data_Type.hex.value, name: Mesh_Info.MESH_ID, size: 6, opt: {aggregate: 1, sep: ':'}},
                                {data_type: Data_Type.uint8.value, name: Mesh_Info.IS_ROOT},
                                {data_type: Data_Type.uint8.value, name: 'channel'},
                                {data_type: Data_Type.int8.value, name: Mesh_Info.RSSI},
                                {data_type: Data_Type.uint8.value, name: Mesh_Info.LAYER},
                                {data_type: Data_Type.hex.value, name: Mesh_Info.PARENT, size: 6, opt: {aggregate: 1, sep: ':'}}],
                                data.rest, data.data);
        if(temp.error == true)
            return temp;
        
        temp.data[Mesh_Info.CH_CONN] = (temp.data.channel & 0xf0) >> 4;
        temp.data[Mesh_Info.CH_CONFIG] = (temp.data.channel & 0x0f);
        
        if((+temp.data.node_size - 23) % 6 != 0)
        {
            _set_error(temp, 'Message command router_table size error [' + data.data.node_size + ']');
            return temp;
        }
        
        let num_tables = (+temp.data.node_size - 23) / 6,
            dc = new Byte_Array();
        temp.data[Mesh_Info.CHILDREN] = [];
        for(let i = 0; i < num_tables; i++)
        {
            dc.raw(temp.rest.slice(0, 6));
            temp.data[Mesh_Info.CHILDREN].push(dc.hex({aggregate: 1, sep: ':'}));
            temp.rest = temp.rest.slice(6);
        }
        
        data.rest = temp.rest;
        
        return data;
    }
    
    static _parse_info(data)
    {
        return Struct.make([{data_type: Data_Type.text.value, name: Mesh_Info.INFO, size: data.data.node_size}],
                              data.rest, data.data);
    }
    
    static _parse_node_command(data)
    {
        let temp = Struct.make([{data_type: Data_Type.uint8.value, name: Mesh_Info.COMMAND_TYPE}], data.rest, data.data);
        if(temp.error == true) return temp;
        
        switch(+temp.data.command_type)
        {
            case Node_Command_Type.ROUTE_TABLE:
                temp.data[Mesh_Info.COMMAND_TYPE_NAME] = 'ROUTE_TABLE';
                return Node_Message0._parse_router_table(temp);
                break;
            case Node_Command_Type.CONFIG:
                temp.data[Mesh_Info.COMMAND_TYPE_NAME] = 'CONFIG';
                return Node_Message0._parse_config(temp);
                break;
            case Node_Command_Type.STATUS:
                temp.data[Mesh_Info.COMMAND_TYPE_NAME] = 'STATUS';
                return Node_Message0._parse_status(temp);
                break;
            case Node_Command_Type.FULL_CONFIG:
                temp.data[Mesh_Info.COMMAND_TYPE_NAME] = 'FULL_CONFIG';
                return Node_Message0._parse_full_config(temp);
                break;
            case Node_Command_Type_Response.INFO:
                temp.data[Mesh_Info.COMMAND_TYPE_NAME] = 'INFO';
                return Node_Message0._parse_info(temp);
                break;
            default:
                _set_error(temp, 'Command message type node defined [' + temp.data.command_type + ']');
        }
        return temp;
    }
    
    static _parse_node_data(data)
    {
        let temp = Struct.make([{data_type: Data_Type.hex.value, name: Mesh_Info.DATA, size: data.rest.length}],
                                data.rest, data.data);
        
        return temp;
    }
}

import {Node_Command_Type} from '../../../components/esp32_br_input/type.js';

export const Mesh_Info = {
    BR_VERSION: 'br_version',
    ADDR: 'from',
    BR_SIZE: 'br_size',
    NODE_VERSION: 'node_version',
    MESSAGE_TYPE: 'message_type',
    MESSAGE_TYPE_NAME: 'message_type_name',
    NODE_SIZE: 'node_size',
    LAYER: 'layer',
    PARENT: 'parent',
    MAC_AP: 'mac_ap',
    MESH_ID: 'mesh_id',
    COMMAND_TYPE: 'command_type',
    COMMAND_TYPE_NAME: 'command_type_name',
    DATA: 'data',
    CHILDREN: 'children',
    CH_CONFIG: 'ch_config',
    CH_CONN: 'ch_conn',
    IS_ROOT: 'is_root',
    RSSI: 'rssi',
    IP_ADDR: 'ip_addr',
    DEV_LIST: 'dev_list',
    NAME: 'name',
    INFO: 'info'
}

export const ESP32_Events = {
    RENDER_DEVICES: 'render_devices',
    RENDER_NET: 'render_net',
    RENDER_MESSAGES: 'render_messages',
    RENDER_BR_CLIENTS: 'render_br_clients',
    RENDER_ROUTERS: 'render_routers',
    ADD_INPUTS: 'add_inputs',
    ENABLE: 'enable',
    ERROR: 'error',
    SEND_MESSAGE: 'send_message'
}

export const Node_Command_Type_Response = {
    INFO: Node_Command_Type.REBOOT + 1
}
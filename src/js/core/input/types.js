import {Data_Type} from '../../libs/byte_array/types.js';

export const Input_Type = {
    [Data_Type.text.value]: {value: Data_Type.text.value, name: Data_Type.text.name, default: true},
    [Data_Type.hex.value]: {value: Data_Type.hex.value, name: Data_Type.hex.name, default: false},
    [Data_Type.binary.value]: {value: Data_Type.binary.value, name: Data_Type.binary.name, default: false},
}
Object.freeze(Input_Type);

export const Input_Events = {
    SET_INPUT: Symbol('set_comm'),
    INSERT_INPUT: Symbol('insert_comm'),
    SEND_INPUT: Symbol('send_comm'),
    ENABLE: Symbol('enable'),
    CHANGE_TYPE: Symbol('change_type'),
    INSERT_KEY: Symbol('insert Key'),
    PASTE: Symbol('paste'),
    CHANGE_STATE: Symbol('change_state'),
    COMMAND_LIST: Symbol('command_list')
}
Object.freeze(Input_Events);
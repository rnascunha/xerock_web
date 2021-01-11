import {Data_Type} from '../../libs/byte_array/types.js';

export const Data_Events = {
    MAKE_OUTPUT: Symbol('make output'),
    POST: Symbol('post'),
    PREPEND: Symbol('prepend'),
    CLEAR: Symbol('clear'),
    REMOVE: Symbol('remove'),
    SELECT: Symbol('select'),
    FILTER: Symbol('filter'),
    DELETE: Symbol('delete'),
    RENDER: Symbol('render'),
    CHANGE_STATE: Symbol('change state'),
    CUSTOM_PAINT: Symbol('custom paint'),
    SERVER_NAME_CHANGE: Symbol('server name change'),
    MESSAGE_SELECT: Symbol('message select')
}
Object.freeze(Data_Events);

export const Output_Type = {
    NONE: {value: 'none', name: 'none', default: true},
    [Data_Type.text.value]: {value: Data_Type.text.value, name: Data_Type.text.name, default: false},
    [Data_Type.hex.value]: {value: Data_Type.hex.value, name: Data_Type.hex.name, default: false},
    [Data_Type.binary.value]: {value: Data_Type.binary.value, name: Data_Type.binary.name, default: false},
}
Object.freeze(Output_Type);

//export const default_filename = 'output_data';

export const table_config = {
    session: { type: 'flexible', min: 3, max: 6},
    mid:    { type: 'flexible', min: 3, max: 6},
    smid:   { type: 'flexible', min: 3, max: 8},
    uid:    { type: 'flexible', min: 3, max: 8},
    sid:    { type: 'flexible', min: 3, max: 8},
    sname:  { type: 'flexible', min: 6, max: 16},
    saddr:  { type: 'flexible', min: 20, max: 25},
    app:    { type: 'flexible', min: 6, max: 20},
    size:   { type: 'flexible', min: 6, max: 8},
    from:   { type: 'flexible', min: 7, max: 20},
    time: { type: 'break-white-force', min: 15},
    id: { type: 'break-white', min: 7, max: 20}
}

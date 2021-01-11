import {DATETIME_FORMAT, TIME_PRECISION} from '../../time_format.js';
import {default_filter, default_filter_hover} from '../libs/custom_paint/types.js';
import {Message_Type} from '../../core/libs/message_factory.js';
import {Input_Type} from '../input/types.js';
import {Output_Type} from '../data/types.js';
import {columns_default} from '../libs/select/types.js';

export const Configure_Events = {
    UPDATE_TYPES: Symbol('update types'),
    UPDATE_STORAGE: Symbol('update storage')
}

export const Append_Input = {
    NONE: { value: 'none', name: 'none', arr: null, default: true},
    NL: { value: 'nl', name: 'NL', title:'New line (0x0a)', arr: [0x0a]},
    CR: { value: 'cr', name: 'CR', title:'Carriage return (0x0D)', arr: [0x0d]},
    NLCR: { value: 'crnl', name: 'CR/NL', title:'Carriage return/New line (0x0d0a)', arr: [0x0d, 0x0a]}
}

export const default_profile_data = function(){
    return {
        configure: {
            types: {
                time: {
                    format: DATETIME_FORMAT.TIME.value,
                    precision: TIME_PRECISION.MILISECONDS.value
                },
                escaped_string: true,
                append: Append_Input.NONE.arr
            },
            storage: {
                save: false,
                filter: {type: [Message_Type.data.value]}
            }
        },
        data: {
            state: {auto_roll: true, type: Output_Type.NONE.value},
            filter: {},
            select: Object.assign([], columns_default),
            custom_paint: {
                custom: [],
                default: Object.assign({}, default_filter),
                hover: Object.assign({}, default_filter_hover)
            }
        },
        input: {
            state: {enter_send: true, type: Input_Type.text.value} ,
            commands_history: [],
        }
    }
};

export const default_profile = 'current';

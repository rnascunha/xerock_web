import {Message_Type} from './libs/message_factory.js';
import {Custom_Paint_Type} from './types.js';
import {Message_Direction} from './libs/message_factory.js';

export function make_app_default_custom_paint(app_name, color, type)
{
    console.assert(typeof app_name === 'string' && typeof color === 'string');
    
    let style = Object.assign({}, {
        backgroundColor: color,
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontSize: '14px',
        fontFamily: 'monospace'
    }),
      filter;  
    
    switch(type)
    {
        case Custom_Paint_Type.CONFIG_RECEIVED:
            filter = {"appf": [app_name], "type": [Message_Type.control.value], "dir": [Message_Direction.received.value]};
            style.fontStyle = 'italic';
            style.fontWeight = 'bold';
            break;
        case Custom_Paint_Type.CONFIG_SEND:
            filter = {"appf": [app_name], "type": [Message_Type.control.value], "dir": [Message_Direction.sent.value]};
            style.fontStyle = 'italic';
            break;
        case Custom_Paint_Type.SENT:
            filter =  {"appf": [app_name],"type": [Message_Type.data.value], "dir": [Message_Direction.sent.value]};
            break;
        default:
            filter = {"appf": [app_name],"type": [Message_Type.data.value], "dir": [Message_Direction.received.value]};
            style.fontWeight = 'bold';
            break;
    }
    
    return {style: style, filter: filter};
}

export function make_all_app_default_custom_paint(app_name, color, types = Object.values(Custom_Paint_Type), cb = null)
{
    types.forEach(type => {
        let f = make_app_default_custom_paint(app_name, color, type);
        if(cb)
            cb(f.style, f.filter);
    });
}
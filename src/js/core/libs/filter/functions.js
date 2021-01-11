import {Message_Type} from '../message_factory.js';
import {Message_Direction} from '../../libs/message_factory.js';

import {Filter_Model} from './model.js';
import {Filter_View} from './view.js';
import {Filter} from './controller.js';

import {App_ID_Template} from '../../id/id_template.js';

export function copy_filter_options(filter)
{
    let new_filter = {
        sid: {},
        time: null,
        dir: Object.keys(Message_Direction),
        type: Object.keys(Message_Type),
        ctype: [],
        session: {},
        app: []
    }
    
    //app
    new_filter.appf = Object.assign([], filter.appf);
    
    //ctype
    new_filter.ctype = Object.assign([], filter.ctype);
    
    //sid
    Object.keys(filter.sid).forEach(sid => {
        new_filter.sid[sid] = {};
        Object.keys(filter[sid]).forEach(app => {
            new_filter[sid][app] = Object.assign([], filter[sid][app]);
        });
    });
    
    //session
    Object.keys(filter.session).forEach(sid => {
        new_filter[sid] = Object.assign([], filter[sid]);
    });
    
    return new_filter
}

export function make_sid_filter(sid)
{
    if(!Array.isArray(sid)) sid = [sid];
    
    return {sid: sid};
}

export function make_app_filter(app)
{    
    return {
        "app": {
            [app.server().id()]: [app.name()]
        },
        "sid": [app.server().id()]
    }
}

//export function make_id_filter(id)
//{
//    console.assert(id instanceof App_ID_Template, 'Argument "id" must be of type ID_Template');
//    
//    return  {
//        "id": {
//            [id.server().id()]: {
//                [id.app().name()]: [id]
//            }
//        },
//        "sid": [id.server().id()],
//        "app": {
//            [id.server().id()]: [id.app().name()]
//        }
//    }
//}

export function make_filter(container, filter_opts = null, filter = {}, opts = {}){
    let model = new Filter_Model(filter_opts, filter);
    return new Filter(model, new Filter_View(model, container, opts));
}

export function dispatch_filter_events(event, callback)
{
    window.app.on(event, callback);
}
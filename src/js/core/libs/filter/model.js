import {Event_Emitter} from '../../../libs/event_emitter.js'
import {Message_Type, Message_Direction} from '../message_factory.js';
import {is_empty, copy} from '../../../helper/object_op.js';
import {Filter_Events, base_filter_opts_template} from './types.js';
import {copy_filter_options} from './functions.js';

export class Filter_Model extends Event_Emitter
{
    constructor(filter_opts = null, filter = {})
    {
        super();
        
        this._filter_opts = this._set_filter_opts(filter_opts, false);
        this._filter = filter;
    }
    
    get(){ return this._filter; }
    update(filter)
    {
        this._filter = filter;
        
        this.emit(Filter_Events.SET_FILTER, this._filter_opts);
        this.emit(Filter_Events.RENDER_DATA, this._filter);
    }
    
    filter(msg){ return Filter_Model.filter(this._filter, msg); }
    
    filter_options(options = null, copy = false)
    {
        if(options !== null)
        {
            this._filter_opts = this._set_filter_opts(options, copy)
            this.emit(Filter_Events.RENDER_FILTER, this._filter_opts);
        }
        
        return this._filter_opts;
    }

    select(filter, recursvely = false, unselect = false, emit = true)
    {        
        if(filter.act === 'clear'){ //clear
            this.clear();
            return;
        }
        
        if(unselect === true)
            this._filter = {};
    
        let p = this._filter,
            i = 0;
        for(; i < filter.key.length - 1; i++)
        {
            if(!p.hasOwnProperty(filter.key[i]))
                p[filter.key[i]] = {};
            p = p[filter.key[i]];
        }
        
        if(recursvely)
        {
            switch(filter.key[0])
            {
                case 'id':
                    this.select({input: filter.key[1], key: ['sid'], act: filter.act}, false, false);
                    this.select({input: filter.key[2], key: ['app', filter.key[1]], act: filter.act}, false, false);
                    break;
                case 'app':
                case 'session':
                    this.select({input: filter.key[1], key: ['sid'], act: filter.act}, false, false);
                    break;
            }
        }
        
        if(filter.act === 'add'){ //add
            this._select_filter(p, filter.key[i], filter.input);
        } else { //remove
            if(p.hasOwnProperty(filter.key[i])){
                p[filter.key[i]] = p[filter.key[i]].filter(e => e != filter.input);
                if(p[filter.key[i]].length === 0) delete p[filter.key[i]];
                this._clean_filter_path(filter.key);
            }
        }
        
        this.emit(Filter_Events.SET_FILTER, this._filter_opts);
        if(emit)
            this.emit(Filter_Events.RENDER_DATA, this._filter);        
    }
    
    _select_filter(filter, key, input)
    {
        if(!(key in filter)){
            filter[key] = [input];
        } else if(!filter[key].find(e => input == e)){
            filter[key].push(input);
        }
    }
    
    _clean_filter_path(prop){
        for(let p = this._filter, i = 0; i < prop.length;){
            if(p.hasOwnProperty(prop[i])){
                if(is_empty(p[prop[i]])){
                    delete p[prop[i]];
                    i = 0;
                    p = this._filter;
                } else 
                    p = p[prop[i++]];
            } else
                break;
        }
    }
    
    clear()
    {
        this._filter = {};
        
        this.emit(Filter_Events.SET_FILTER, this._filter_opts);
        this.emit(Filter_Events.RENDER_DATA, this._filter);
    }
    
    _set_filter_opts(filter, copy)
    {
        if(typeof filter !== 'object' || filter === null)
            return copy ? 
                copy_filter_options(base_filter_opts_template) : 
                base_filter_opts_template;
        
        if(!filter.hasOwnProperty('appf'))
            filter.app = [];
        
        if(!filter.hasOwnProperty('sid'))
            filter.sid = {};
        
        if(!filter.hasOwnProperty('session'))
            filter.session = {};
        
        if(!filter.hasOwnProperty('dir'))
            filter.dir = Object.keys(Message_Direction);
        
        if(!filter.hasOwnProperty('type'))
            filter.type = Object.keys(Message_Type);
        
        if(!filter.hasOwnProperty('ctype'))
            filter.ctype = [];
                
        return filter;
    }

    add_option(msg)
    {
        let filter = this._filter_opts, flag = false;
        
        if(msg.type === Message_Type.control.value){
            if(filter.ctype.findIndex(e => e == msg.ctype) === -1){
                filter.ctype.push(msg.ctype);
                flag = true;
            }
        }
        
        if(!filter.sid.hasOwnProperty(msg.sid)){
            filter.sid[msg.sid] = {};
            flag = true;
        }
        
        if(!filter.sid[msg.sid].hasOwnProperty(msg.app)){
            filter.sid[msg.sid][msg.app] = [];
            flag = true;
        }
                
        if(msg.hasOwnProperty('id')){
            if(filter.sid[msg.sid][msg.app].findIndex(e => e == msg.id_str) === -1){
                filter.sid[msg.sid][msg.app].push(msg.id_str);
                flag = true;
            }
        }
        
        if(!(msg.sid in filter.session))
        {
            filter.session[msg.sid] = [msg.session];
            flag = true;
        }
        else if(filter.session[msg.sid].findIndex(session => msg.session == session) === -1)
        {
            filter.session[msg.sid].push(msg.session);
            flag = true;
        }
        
        if(!filter.appf.find(app => msg.app === app))
        {
            filter.appf.push(msg.app);
            flag = true;    
        }
        
        if(flag)
            this.emit(Filter_Events.RENDER_FILTER, this._filter_opts);
    }
    
    is_selected(prop, value){
        return Filter_Model.is_selected(this._filter, prop, value);
    }
        
    _filter_array(prop, value){
        return Filter_Model(this._filter, prop, value);
    }
            
    static filter(filter, msg){
        if(is_empty(filter)) return true;
                
        if(!Filter_Model._filter_array(filter, ['sid'], msg.sid)) return false;
        if(!Filter_Model._filter_array(filter, ['dir'], msg.dir)) return false;
        if(!Filter_Model._filter_array(filter, ['type'], msg.type)) return false;
        if(msg.hasOwnProperty('ctype'))
            if(!Filter_Model._filter_array(filter, ['ctype'], msg.ctype)) return false;

        if(!Filter_Model._filter_array(filter, ['id', msg.sid, msg.app], msg.id_str)) return false;
        
        if(!Filter_Model.is_selected(filter, ['id', msg.sid, msg.app], msg.id_str))
            if(!Filter_Model._filter_array(filter, ['app', msg.sid], msg.app)) return false;
        
        if(!Filter_Model._filter_array(filter, ['session', msg.sid], msg.session)) return false;
        
        if(!Filter_Model._filter_array(filter, ['appf'], msg.app)) return false;

        return true;        
    }
        
    static _filter_array(filter, prop, value)
    {
        let p = filter;
        for(let i = 0; i < prop.length; i++){
            if(!p.hasOwnProperty(prop[i])) return true;
            p = p[prop[i]];
        }
        
        if(p.findIndex(e => e == value) === -1) return false;
        
        return true;
    }
    
    static is_selected(filter, prop, value)
    {
        let p = filter;
        for(let i = 0; i < prop.length; i++){
            if(!p.hasOwnProperty(prop[i])) return false;
            p = p[prop[i]];
        }

        if(!p.find(e => e == value)) return false;
        
        return true;
    }
}

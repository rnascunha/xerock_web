import {App_Template} from '../app/app_template.js';
import {Filter_Model} from '../libs/filter/model.js';
import {is_id_at_list} from './functions.js';

export const ID_Types = {
    One2One: '1to1',
    One2N: '1toN',
    One2All: '1toAll'
}

export class App_ID_Template
{
    constructor(value, app, name = value, type = ID_Types.One2One)
    {
        console.assert(app instanceof App_Template, '"app" paremeter must be a "App_Template"');
        
        this._value = value;
        this._name = typeof name === 'string' ? name : JSON.stringify(name);
        this._app = app;
        this._type = type
    }
    
    app(){ return this._app; }
    value() {return this._value; }
    name(){ return this._name; }
    type(){ return this._type; }
    
    server(){ return this._app.server(); }
    app_name(){ return this._app.name; }
        
    send(data, to, opt = {})
    {
        this.app().send(data, this, to, opt);
    }
    
    full_name()
    {
        if(this.server().name())
            return `${this.server().name()}:${this._app.name()}:${this._name}`;
        return `${this.server().addr()}:${this._app.name()}:${this._name}`;
    }
    
    //Compare to other ids
    is_equal(other_id)
    {
        console.assert(other_id instanceof App_ID_Template, "compare_id");
        
        if(this.app().server() != other_id.app().server() 
           || this.app() != other_id.app()) return false;
        
        return this.compare_ids(other_id);
    }
    
    compare_ids(other_id)
    {
        return other_id instanceof App_ID_Template ? 
            JSON.stringify(this.value()) == JSON.stringify(other_id.value()) :
            JSON.stringify(this.value()) == JSON.stringify(other_id);
    }
    
    //Compare to messages
    is_message_to_id(message, compare_exactly = false)
    {
        if(this.app().name() !== message.app) return false;
        if(this.server().addr() !== message.saddr) return false;
        return this.compare_message_id(message, compare_exactly);
    }
    
    compare_message_id(message, compare_exctly){ return true; }
        
    is_at_list(list)
    {
        return is_id_at_list(this, list);
    }
    
    filter_message(message, compare_exactly = false, other_filters = {})
    {
        if(!Filter_Model.filter(other_filters, message)) return false;
        return this.is_message_to_id(message, compare_exactly);
    }
}
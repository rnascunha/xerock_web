import {Event_Emitter} from '../../libs/event_emitter.js';

import {make_filter} from '../libs/filter/functions.js';
import {Filter} from '../libs/filter/controller.js';
import {Filter_Events} from '../libs/filter/types.js';

import {make_select} from '../libs/select/functions.js';
import {Select_Events} from '../libs/select/types.js';

import {make_view} from './view/functions.js';

import {Data_Events} from './types.js';
import {Register_ID_Events} from '../id/types.js';

import {View_Events} from './view/types.js';
import {App_Events} from '../types.js';

let msg_id = 0, pre_id = 0;

export class Data_Model extends Event_Emitter
{
    constructor(options = {})
    {
        super();
        this._data = [];
        
        this._filter = null;
        this._select = null;
        this._view = null;
        
        this._options = options;
    }
    
    init(containers)
    {
        this._filter = make_filter(containers.filter);
        this._filter.on(Filter_Events.RENDER_DATA, filter => {
            this.check_filter(filter);
            this.emit(Filter_Events.RENDER_DATA, filter);
        });
        this._filter.on(Filter_Events.RENDER_FILTER, options => this.emit(Filter_Events.RENDER_FILTER, options));

        this._select = make_select(containers.select, this._options.selected, this._options.columns);
        this._select.on(Select_Events.RENDER_DATA, selected => this.emit(Data_Events.SELECT, selected));   
        
        this._view = make_view(containers.view);
        
        //Emitting events > data > Views
        this.on(Register_ID_Events.CHECK_IDS, args => this._view.emit(Register_ID_Events.CHECK_IDS, args));
        this._view.on(Register_ID_Events.PROPAGATE, reg_ids => this.emit(Register_ID_Events.PROPAGATE, reg_ids))
                    .on(View_Events.SELECT_ID, args => 
                                this._data.forEach(d => args.view.emit(App_Events.RECEIVED_MESSAGE, d.data)));
    }
    
    get select(){ return this._select; }
    get filter(){ return this._filter; }
    get view(){ return this._view; }
    get data(){ return this._data; }
        
    register_view(name, view, options = {}){ this._view.register(name, view, options); }
    
    prepend(data, id = null)
    {
        data = this._make_data(data, id);
        this._insert_data(data, false);
    }
    
    post(data)
    {
        data = this._make_data(data);
        this._insert_data(data);
    }
            
    clear(clear_storage = true)
    {
        this._data = [];
        this.emit(Data_Events.CLEAR);
        
        if(clear_storage)
            this.emit(Data_Events.CLEAR);
    }
    
    clear_filter(filter, clear_storage = true)
    {
        this._data.forEach(d => {
            if(Filter.filter(filter, d.data))
                this._delete_data(d, clear_storage);
        });
    }
    
    remove(data, clear_storage = true)
    {
        let f_data = null;
        if(data instanceof HTMLElement)
            this._data = this._data.filter(d => {
                if(d.container == data)
                {
                    f_data = d;
                    return false;
                }
                return true
            });
        else if(typeof data === 'number') 
            this._data = this._data.filter(d => {
                if(d.id == data)
                {
                    f_data = d;
                    return false;
                }
                return true
            });
        else{
            f_data = data;
            this._data = this._data.filter(d => d != data);
        }
        
        if(f_data) this._delete_data(f_data, clear_storage);
    }
    
    message_select(line)
    {
        let f_data = this._data.find(d => d.container === line);
        if(f_data)
            this.emit(Data_Events.MESSAGE_SELECT, f_data);
    }
    
    check_filter(filter)
    {
        this._data.forEach(d => {
            let filtered = d.filter;
            d.filter = this.filter.filter(d.data);
            if(d.filter != filtered){
                this.emit(Data_Events.FILTER, d);
            }
        });
    }
    
    update_server_name(id, new_name)
    {
        this._data.forEach(d => {
            if(d.data.sid === id){
                d.data.sname = new_name;
                this.emit(Data_Events.SERVER_NAME_CHANGE, d);
            }
        });
    }
    
    _insert_data(data, post = true)
    {
        if(post) data.data.mid = msg_id++;
        else data.data.mid = --pre_id;
        
        this._filter.add_option(data.data);
        
        this.emit(Data_Events.MAKE_OUTPUT, data);
        
        if(post)
        {
            this._data.push(data);
            this.emit(Data_Events.POST, data);
            this._view.emit(Data_Events.POST, data.data);
        } else {
            this._data.unshift(data);
            this.emit(Data_Events.PREPEND, data);
        }
    }
    
    _make_data(data, id = null)
    {
        return {data: data, container: null, filter: this._filter.filter(data), id: id};
    }
    
    _delete_data(data, clear_storage = false)
    {
        this.emit(Data_Events.DELETE, data);
        if(clear_storage && 'id' in data && data.id !== null)
            this.emit(Data_Events.CLEAR, data.id);
    }
    
    _get_data(data)
    {
        let f_data = null;
        if(data instanceof HTMLElement)
            this._data = this._data.filter(d => {
                if(d.container == data)
                {
                    f_data = d;
                    return false;
                }
                return true
            });
        else if(typeof data === 'number') 
            this._data = this._data.filter(d => {
                if(d.id == data)
                {
                    f_data = d;
                    return false;
                }
                return true
            });
        else{
            f_data = data;
            this._data = this._data.filter(d => d != data);
        }
        
        return f_data;
    }
}

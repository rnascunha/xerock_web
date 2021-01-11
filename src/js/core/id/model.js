import {Event_Emitter} from '../../libs/event_emitter.js';
import {Register_ID_Events} from './types.js';
import {Register_ID} from './controller.js';
import {App_ID_Template} from './id_template.js';

export class Register_ID_Model extends Event_Emitter
{
    constructor(options = {})
    {
        super();
        this._list = {};
        this._selected = null;
        
        this._opt = options;        
    }
    
    has_ids()
    {
        return this.flat_list().length;
    }
    
    list()
    {
        return Object.assign({}, this._list);
    }
    
    options(opt = null)
    {
        if(opt !== null)
        {
            console.assert(typeof opt === 'object', 'Arg "opt" must be of type "object"');
            this._opt = opt;
            this.emit(Register_ID_Events.RENDER, this._list);
        }
        
        return Object.assign({}, this._opt);
    }    
    
    flat_list()
    {
        let list = [];
        Object.keys(this.list()).forEach(server_addr => {
            Object.keys(this.list()[server_addr]).forEach(app_name => {
                this.list()[server_addr][app_name].forEach(id => {
                    list.push({addr: server_addr, app_name: app_name, id: id});
                });
            });
        });
        
        return list;
    }
    
    push_ids(ids)
    {
        let addr = ids.server.full_addr(),
            app_name = ids.app.name();
        
        if(!(addr in this._list))
            this._list[addr] = {};
 
        let n_list = ids.ids instanceof Array ? ids.ids : [ids.ids];
    
        this._list[addr][app_name] = Register_ID_Model.filter_ids(n_list, this._opt);
        
        this.emit(Register_ID_Events.RENDER, this._list);
        this.emit(Register_ID_Events.CHECK_IDS, this.list());
    }
    
    check_ids(list = {})
    {
        this._list = {};

        Object.values(list).forEach(apps => {
            Object.values(apps).forEach(ids => {
                if(ids.length)
                    this.push_ids({server: ids[0].server(), app: ids[0].app(), ids: ids}); 
            });
        });
        
        this.emit(Register_ID_Events.RENDER, this._list);
        this.emit(Register_ID_Events.CHECK_IDS, this.list());
    }
    
    clean(server)
    {
        delete this._list[server.full_addr()];
        this.emit(Register_ID_Events.RENDER, this._list);
        this.emit(Register_ID_Events.CHECK_IDS, this.list());
    }
    
    selected(sel = null)
    {
        if(sel !== null) {
            console.assert(sel instanceof App_ID_Template, 'Arg "sel" is not of type App_ID_Template')
            this._selected = sel;
            this.emit(Register_ID_Events.RENDER, this._list);
        }
        
        return this._selected;
    }
    
    check_selected(value)
    {
        this._selected = value ? this._id_from_value(value) : null;
    }
        
    make_value(id)
    {
        console.assert(id instanceof App_ID_Template, 'Arg "id" is not of type App_ID_Template');

        return JSON.stringify({addr: id.server().full_addr(), app: id.app().name(), id: id.value()})
    }
    
    propagate(reg_ids = null)
    {
        if(reg_ids !== null)
        {
            if(!Array.isArray(reg_ids)) reg_ids = [reg_ids];
            reg_ids.forEach(id => {
                if(id instanceof Register_ID_Model || 
                   id instanceof Register_ID) id.check_ids(this._list);
            });
            return;
        }
        this.emit(Register_ID_Events.CHECK_IDS, this.list()); 
    }
    
    static id_check_options(id, opt)
    {
        console.assert(id instanceof App_ID_Template, 'Arg "id" is not of type App_ID_Template');
        console.assert(typeof opt === 'object', 'Arg "opt" must be of type "object"');
        
        if(opt.hasOwnProperty('exclude_app'))
        {
            let exclude = opt.exclude_app;
            if(!(exclude instanceof Array || typeof exclude == 'string'))
                console.error('"exclude_app" option must be a app name (string) or a array of app names');
            else {
                if(typeof exclude == 'string') exclude = [exclude];
                
                if(exclude.find(app_ex => id.app().name() === app_ex))
                    return false;
            }
        }
        
        if(opt.hasOwnProperty('include_only_app'))
        {
            let include = opt.include_only_app;
            if(!(include instanceof Array || typeof include == 'string'))
                console.error('"include_only_app" option must be a app name (string) or a array of app names');
            else {
                if(typeof include == 'string') include = [include];
                
                if(!include.find(app_in => id.app().name() === app_in))
                    return false;
            }
        }
        
        if(opt.hasOwnProperty('exclude_type'))
        {
            let type_ex = opt.exclude_type;
            if(!(type_ex instanceof Array || typeof type_ex == 'string'))
                console.error('"exclude_type" option must be a app name (string) or a array of id types');
            else {
                if(typeof type_ex == 'string') type_ex = [type_ex];
                
                if(type_ex.find(type => id.type() === type))
                    return false;
            }
        }
        
        if(opt.hasOwnProperty('include_only_type'))
        {
            let type_in = opt.include_only_type;
            if(!(type_in instanceof Array || typeof type_in == 'string'))
                console.error('"include_only_type" option must be a app name (string) or a array of id types');
            else {
                if(typeof type_in == 'string') type_in = [type_in];
                
                if(!type_in.find(type => id.type() === type))
                    return false;
            }
        }
        
        return true;
    }
    
    static filter_ids(ids, opt)
    {
        console.assert(ids instanceof Array, 'Arg "id" is not of type Array');
        console.assert(typeof opt === 'object', 'Arg "opt" must be of type "object"');
        
        return ids.filter(id => Register_ID_Model.id_check_options(id, opt));
    }
    
    _id_from_value(value_str)
    {
        if(value_str === 'null') return null;

        let value = JSON.parse(value_str);
        console.assert(value.hasOwnProperty('addr') && 
                       value.hasOwnProperty('app') && 
                       value.hasOwnProperty('id'), 'Not valid value');
        
        if(!(this.list().hasOwnProperty(value.addr) 
            && this.list()[value.addr].hasOwnProperty(value.app)))
            return null;
        
        let f_id = null;
        this.list()[value.addr][value.app].some(id => {
            if(id.compare_ids(value.id)){
                f_id = id;
                return true;
            }
            return false;
        });
        
        return f_id
    }
}

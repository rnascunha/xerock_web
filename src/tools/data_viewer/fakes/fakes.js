import {App_Template} from '../../../js/core/app/app_template.js';
import {Event_Emitter} from '../../../js/libs/event_emitter.js';
import {Register_ID_Events} from '../../../js/core/id/types.js';
import {App_ID_Template, ID_Types} from '../../../js/core/id/id_template.js';
import {Register_ID_Model} from '../../../js/core/id/model.js';

export class Fake_ID extends App_ID_Template
{
    constructor(value, app, name, from, from_name, type = ID_Types.One2One)
    {
        super(name + '>' + from_name, app, name, type);
        this._from = from;
        this._from_name = from_name;
    }
    
    name(add_from = true)
    {
        if(add_from)
            return `${this._name}${this._from_name === this._name ? '' : '>' + this._from_name}`;
        else
            return this._name;
    }
    
    from(){ return this._from; }
    from_name(){ return this._from_name; }
    
    full_name()
    {
        return `${this.server().file().name()}:${super.full_name()}${this._from_name === this._name ? '' : '>' + this._from_name}`;
    }
    
    is_equal(other_id)
    {
        console.assert(other_id instanceof App_ID_Template, "compare_id");
        
        if(this.server().file() != other_id.server().file())  return false;
        
        return super.is_equal(other_id);
    }
    
    compare_ids(other_id)
    {
        if(other_id instanceof App_ID_Template)
        {
            if(this.name(false) != other_id.name(false)) return false;
            if(this.type() != ID_Types.One2One) return true;
            return this.from_name() == other_id.from_name();
        }
                
        return super.compare_ids(other_id);
    }
    
    is_message_to_id(message, compare_exactly = false)
    {
        if(this.server().file().name() !== message.file) return false;
        if(this.app().name() !== message.app) return false;
        if(this.server().addr() !== message.saddr) return false;
        return this.compare_message_id(message, compare_exactly);
    }
    
    compare_message_id(message, compare_exctly)
    { 
        if(this.name(false) != message.id_str) return false;
        if(this.type() != ID_Types.One2One || !compare_exctly) return true;
        return this.from_name() == message.from_str;
    }
}

export class Fake_App extends App_Template
{
    constructor(name, server)
    {
        super(name, server);
        
        this._name = name;
        this._server = server;
        this._ids = [];
    }
    
    name(){ return this._name; }
    server(){ return this._server; }
    
    ids(){ return this._ids; }
    
    message(message)
    {
        if(!('id_str' in message)) return;
        
        if(!this._ids.some(id => message.id_str == id.name(false) && message.from_str == id.from_name()))
            this._ids.push(new Fake_ID(message.id, this, message.id_str, message.from, message.from_str));
        
        /*
        * Checking if necessary create ID to all
        */
        let count_id = 0;
        this._ids.some(id => {
            if(message.id_str === id.name(false))
            {
                if(id.type() != ID_Types.One2All)
                {
                    count_id++;
                    return false;
                } else {
                    count_id = 0;
                    return true;
                }
            }
        });
        if(count_id > 1)
            this._ids.push(new Fake_ID(message.id, this, message.id_str, 'all', 'all', ID_Types.One2All));
    }
}

export class Fake_Server
{
    constructor(id, addr, name, file)
    {
        this._id = id;
        this._addr = addr;
        this._name = name;
        
        this._file = file;
        
        this._apps = {};
    }
    
    id(){ return this._id; }
    full_addr(){ return `${this._file.name()}:${this._addr}`; }
    addr(){ return this._addr; }
    name(name){ return this._name; }
    file(){ return this._file; }
    
    apps(){ return this._apps; }
    
    message(message)
    {
        if(!(message.app in this._apps))
            this._apps[message.app] = new Fake_App(message.app, this);
        
        this._apps[message.app].message(message);
    }
}

export class Files
{
    constructor(file_name)
    {
        this._name = file_name;
        this._servers = {};
    }
    
    name(){ return this._name; }
    servers(){ return this._servers; }
    
    message(message)
    {
        if(!(message.saddr in this._servers))
            this._servers[message.saddr] = new Fake_Server(message.sid, message.saddr, message.sname, this);
        
        this._servers[message.saddr].message(message);
    }
}

export class Fake_Core extends Event_Emitter
{
    constructor(data)
    {
        super();
        
        this._data = data;
        this._input_id = new Register_ID_Model();
        
        this._files = {};
        
        this._data.on(Register_ID_Events.PROPAGATE, input => this._input_id.propagate(input));
        this._input_id.on(Register_ID_Events.CHECK_IDS, list => this._data.emit(Register_ID_Events.CHECK_IDS, list));
    };
    
    get data(){ return this._data; }
    files(){ return this._files; }
    
    message(message)
    {
        if(!(message.file in this._files))
            this._files[message.file] = new Files(message.file);
        
        this._files[message.file].message(message);
    }
    
    register_view(name, view, options = {})
    {
        this._data.register_view(name, view, {...{input: false}, ...options});
    }
    
    emit_ids()
    {
        let list = this._input_id.list();
        Object.values(this._files).forEach(file => {
            Object.values(file.servers()).forEach(server => {
                Object.values(server.apps()).forEach(app => {
                    if(!(server.full_addr() in list)) list[server.full_addr()] = {};
                    if(!(app.name() in list[server.full_addr()])) list[server.full_addr()][app.name()] = [];

                    list[server.full_addr()][app.name()] = app.ids();//Object.values(app.ids());
                });
            });
        });
                
        this._input_id.check_ids(list);
    }
}
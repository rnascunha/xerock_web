import {Event_Emitter} from '../../libs/event_emitter.js';
import {Server_Events} from './types.js';

export const local_id = 0;
export const local_addr = 'local://127.0.0.1:0';
export const local_name = 'local';
const server_user_id = 0;
const user_id = 1;

let smid = 0;

export class Local_Server extends Event_Emitter
{
    constructor()
    {
        super();
        this._session = '-';
    }
    
    init(){ this.load_connection(this.id(), this.addr(), {name: this.name(), session: this._session}) }
    
    id(){ return local_id; }
    addr(){ return local_addr; }
    //This function is made to be overriden at data view
    full_addr(){ return this.addr(); }
    name(){ return local_name; }
    server_message_id(){ return smid++; }
    server_user_id(){ return server_user_id; }
    user_id(){ return user_id; }
    
    _save_connection()
    {
        this.emit(Server_Events.SAVE_CONNECTION, {
            id: this.id(), 
            addr: this.addr(), 
            opts: {
                name: this.name(),  
                session: this._session                                
            } 
        });
    }
    
    load_connection(id, addr, options)
    {
        this._session = Number.isInteger(options.session) ? ++options.session : 0;
        this._save_connection();
    }
    
    get session(){ return this._session; };
}

//export const local_server = new Local_Server();
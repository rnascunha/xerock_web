const local_id = 0;
const local_addr = 'local://127.0.0.1:0';
const local_name = 'local';
const server_user_id = 0;
const user_id = 1;

let smid = 0;

class Local_Server
{
    constructor()
    {
        this._session = '-';
    }
    
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
        app.configure()
            .save_connection(this.id(), this.addr(), 
                                                { 
                                                    name: this.name(),  
                                                    session: this.session 
                                                });
    }
    
    load_connection(id, addr, options)
    {
        this._session = Number.isInteger(options.session) ? ++options.session : 0;
        this._save_connection();
    }
    
    get session(){ return this._session; };
}

export const local_server = new Local_Server();
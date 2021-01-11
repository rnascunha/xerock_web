import {Event_Emitter} from '../../libs/event_emitter.js';
import {Input_Events, Input_Type} from './types.js';
import {History_Commands} from './history_commands/history_commands.js';
import {Commands} from './commands/commands.js';
import {Byte_Array} from '../../libs/byte_array/byte_array.js';
import {Data_Type} from '../../libs/byte_array/types.js';

let allowed_chars = [' '];

function is_allowed_char(char, allowaed_char_arr = allowed_chars)
{
    return allowaed_char_arr.find(d => char == d) != null;
}

export class Input_Model extends Event_Emitter
{
    constructor()
    {
        super();
        
        this._history = null;
        this._commands = null;
                
        this._byte_array = new Byte_Array();
    }
    
    init(container_hcomm, container_comm)
    {
        if(container_hcomm)
        {
            this._history = new History_Commands(container_hcomm);
            this._history.on(Input_Events.SET_INPUT, comm => this.set_input(comm.data, comm.type))
                            .on(Input_Events.SEND_INPUT, comm => this.send_input(comm.data, comm.type));
        }
        
        if(container_comm)
        {
            this._commands = new Commands(container_comm);
            this._commands.on(Input_Events.SET_INPUT, comm => this.set_input(comm.data, comm.type))
                              .on(Input_Events.SEND_INPUT, comm => this.send_input(comm.data, comm.type));
        }
    }
    
    get history(){ return this._history; }
    
    enable(en)
    {
        this.emit(Input_Events.ENABLE, en);
    }
    
    register(comm)
    {
        this._commands.register(comm);
    }
    
    set_type(type)
    {
        this.emit(Input_Events.CHANGE_TYPE, type);
    }
    
    set_input(data, type = null)
    {
        this.emit(Input_Events.SET_INPUT, {data: data, type: type});
    }
    
    insert(data)
    {
        this.emit(Input_Events.INSERT_INPUT, data);
    }
    
    send_input(data = '', type = null)
    {
        if(data.length == 0) return;
                
        try{
            this._byte_array.from(Byte_Array.clear_invalid_char(data, type), 
                                  type, window.app.configure().types.type_options);

            if(window.app.configure().types.input_append)
                this._byte_array.raw(
                    this._byte_array.raw()
                        .concat(window.app.configure().types.input_append));
        }catch(e){
            console.error(e.code, e.message, e.args);
            return;
        }
        
        if(this._byte_array.size() == 0) return;        
        this._history.add(this._byte_array.to(type), type);
        
        this.emit(Input_Events.COMMAND_LIST, this._history.list());
        this.emit(Input_Events.SEND_INPUT, {input: this._send_type(type), type: type});
    }
    
    /*
    * Define how the data will be sent to the daemon (some "stuff" is due historical reasons)
    * 
    * String is sent as string if all chars are ascii, otherwise is sent as binary... binary data is sent as Uint8Array (dã...)
    * When Uint8Array is stringfied becomes a object where the keys are index of the array.
    *
    * note: generally, apps sent binary data as arrays (why the diference?)
    * note2: define a unique way to transport binary data
    */
    _send_type(type)
    {
        return type === Data_Type.text.value && this._byte_array.is_ascii_string() ? 
                    this._byte_array.to(Data_Type.text.value) : 
                    new Uint8Array(this._byte_array.raw());
    }
    
    events(event, args)
    {
        switch(event)
        {
            case Input_Events.CHANGE_TYPE:
                this._on_change_type(args.event, args.state, args.pre);
                break;
            case Input_Events.INSERT_KEY:
                return this._on_insert_key(args.event, args.state);
                break;
            case Input_Events.PASTE:
                return this._on_paste(args.event, args.state);
                break;
            case Input_Events.SEND_INPUT:
                this._on_send_input(args)
                break;
        }
    }
    
    _on_change_type(event, state, pre)
    {
        if(state.type === pre) return;
        
        this.emit(Input_Events.CHANGE_TYPE, state);
        
        try{
            this._byte_array.from(state.value, pre, {separator: undefined});
            this.set_input(this._byte_array.to(state.type));
        }catch(e){
            console.error(e.code, e.message, e.args);        
        }
    }
    
    _on_insert_key(event, state)
    {
        switch(event.key){
            case 'Enter':
                if(state.enter_send)
                    this.send_input(state.value, state.type);
                else return false;
                break;
            case 'ArrowUp':
                {
                    let comm = this._history.previous();
                    if(comm)
                        this.set_input(comm.data, comm.type);
                }
                break;
            case 'ArrowDown':
                {
                    let comm = this._history.next();
                    if(comm)
                        this.set_input(comm.data, comm.type);
                }
                break;
            case 'Escape':
                this.set_input('');
                break;
            default:
                return this._on_char_key(event, state);
        }
        
        return true;
    }
    
    _on_char_key(event, state)
    {
        //if control keys do nothing;
        if(event.altKey || event.ctrlKey) return false;
        //If not ascii char (any other char like F?...), do nothing
        if(!Byte_Array.is_ascii_char(event.key)) return false;
        
        if(Byte_Array.is_valid_char(event.key, state.type) || is_allowed_char(event.key))
            return false;
        return true;
    }
    
    _on_paste(event, state)
    {
        let data = (event.clipboardData || window.clipboardData).getData('text');

        this.insert(Byte_Array.clear_invalid_char(data, state.type));
        return true;
    }
    
    _on_send_input(args)
    {
        this.send_input(args.value, args.type);
    }
}
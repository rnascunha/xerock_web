import {Event_Emitter} from '../../libs/event_emitter.js';
import {copy} from '../../helper/object_op.js';
import {Script_Events, Script_Errors, polling_default_ms} from './types.js';
import {sleep} from '../../helper/helpers_basic.js';
import {Message_Info} from '../types.js';
import {Message_Type} from '../libs/message_factory.js';
import {is_id_at_list} from '../id/functions.js';

export class Script_Token{
    constructor(){
        this.reset();
    }
    
    reset(){
        this._cancel = false;
        this._reason = '';
    }
    
    is_cancelled(){
        return this._cancel;
    }
    
    cancel(reason = ''){
        this._cancel = true;
        this._reason = reason;
    }
    
    reason(reason = null){
        if(reason) this._reason = reason;
        return this._reason;
    }
}

export class Script_Template extends Event_Emitter
{
    constructor(name, description = "")
    {
        super();
        
        this._name = name;
        this._description = description;
        this._token = new Script_Token();
        this._id_monitor = [];
        
        this.on(Script_Events.CHECK_IDS, list => {
            this._check_ids(list);
        })
            .on(Script_Events.RECEIVED_MESSAGE, message => {
//                script.emit(Script_Events.RECEIVED_MESSAGE, message);
        });
    }
    
    name(){ return this._name; }
    description(){ return this._description; }
        
    monitor_ids(ids)
    {
        if(!Array.isArray(ids)) ids = [ids];
        this._id_monitor = ids;
    }
    
    clear_monitor_ids(){ this._id_monitor = []; }
    
    _check_ids(list)
    {
        this._id_monitor.forEach(id => {
            if(!(id.server().addr() in list))
                this.cancel(Script_Errors.SERVER_DISCONNECT);
            else if(!(id.app().name() in list[id.server().addr()]))
                this.cancel(Script_Errors.APP_UNREGISTERED);
            else if(!list[id.server().addr()][id.app().name()].some(nid => id.compare_ids(nid, true)))
                this.cancel(Script_Errors.ID_REMOVED);
        });
    }
    
    run()
    {
        console.error('Method "run" from "Script_Template" MUST be overrided!');
    }
    
    reset()
    {
        this._token.reset();
    }
    
    cancel(reason = '')
    {
        this._token.cancel(reason);
    }
    
    token()
    {
        return this._token;
    }
    
    is_cancelled()
    {
        return this._token.is_cancelled();
    }
    
    reason(reason = null)
    {
        return this._token.reason(reason);
    }
    
    async script_busy_loop(time_wait_ms = polling_default_ms)
    {
        while(!this.is_cancelled()) await sleep(time_wait_ms);
    }

    async delay(time_wait_ms)
    {
        let hundreds = Math.floor(time_wait_ms / polling_default_ms),
            remainder = time_wait_ms % polling_default_ms;

        for(let i = 0; i < hundreds; i++){
            if(this.is_cancelled()) return false;
            await sleep(polling_default_ms);
        }
        await sleep(remainder);
        if(this.is_cancelled()) return false;
        return true;    
    }
}
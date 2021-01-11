import {Event_Emitter} from '../../libs/event_emitter.js';
import {Script_Events, Script_Errors, Script_Result_Status} from './types.js';
import {get_time} from '../libs/message_factory.js';

export class Script extends Event_Emitter
{
    constructor(script)
    {
        super();
        
        this._script = script;
        this._running = false;
        
        this._container = null;
        
        this._results = [];
        
        this.on(Script_Events.CHECK_IDS, list => script.emit(Script_Events.CHECK_IDS, list))
            .on(Script_Events.RECEIVED_MESSAGE, message => {
            if(this.is_running())
                script.emit(Script_Events.RECEIVED_MESSAGE, message);
        });
    }
    
    is_running(){
        return this._running;
    }
    
    cancel(reason = '')
    {
        this._script.cancel(reason);
    }
    
    results(){
        return copy(this._results);
    }
    
    enable(en)
    {
        if(this._script.enable){
            this._script.enable(en);
        }
    }

    run()
    {
        if(this._set_status(true)){
            this._error('');
            this._script.reset();
            
            let res = {};
            res.init = get_time();
            this.enable(true);
            
            new Promise(async (resolve, reject) => {
                await this._script.run() ? resolve() : reject();
            }).then(()=> {
                this._set_status(false);                
                res.status = Script_Result_Status.COMPLETED;
            }).catch(() => {
                this._set_status(false, `${this._script.reason() ? this._script.reason() : 'ERROR'}`);
                res.status = Script_Result_Status.ERROR;
                res.reason = this._script.reason();
            }).finally(() => {
                this.enable(false);
                this._script.clear_monitor_ids();
//                this._script.unregister_event(Script_Events.RECEIVED_MESSAGE);
                res.end = get_time();
                this._results.push(res);
            });
        }
    }
        
    element(container)
    {
        this._container = container;
        
        let menu = document.createElement('my-retract-menu');
        
        let name = document.createElement('div');
        name.setAttribute('class', 'script-executor-name');
        name.setAttribute('slot', 'title');
        name.textContent = this._script.name();
        menu.appendChild(name);
        
        if(this._script.element)
        {
            let div = document.createElement('div');
            let shadow = div.attachShadow({mode: 'open'});
            
            shadow.appendChild(this._script.element());
            menu.appendChild(div);
        }
        
        let button = document.createElement('button');
        button.setAttribute('class', 'script-button');
        button.onclick = (event) => { 
            if(this._running)
                this._script.cancel(Script_Errors.BUTTON_CANCEL);
            else this.run();
            
        };
        
        menu.appendChild(button);
        
        let error = document.createElement('div');
        error.setAttribute('class', 'script-error');        
        menu.appendChild(error);
        
        this._container.appendChild(menu);
        
        menu.show = false;  
        this._set_button();
    }
    
    _set_status(status, error = ''){
        if(this._running && status){
            this._error(Script_Errors.SCRIPT_RUNNING);
            return false;
        } 
        
        this._error(error);
        this._running = status;
        
        this._set_button();

        return true;
    }
    
    _error(error){
        this._container.querySelector('.script-error').textContent = error;
    }
    
    _set_button()
    {
        let button = this._container.querySelector('.script-button');
        if(this._running){
            button.classList.add('script-button-cancel');
            button.classList.remove('script-button-run');
            button.textContent = 'cancel';
        } else {
            button.classList.remove('script-button-cancel');
            button.classList.add('script-button-run');
            button.textContent = 'run';
        }
    }
}
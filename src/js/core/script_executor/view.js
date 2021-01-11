import {Event_Emitter} from '../../libs/event_emitter.js';

export class Script_Executor_View extends Event_Emitter
{
    constructor(model, container)
    {
        super();
        
        this._model = model;
        this._container = container;
        
        this._model.on('add_script', script => this.add_script(script));
    }
    
    render()
    {
        this._container.innerHTML = `<h3>Scripts</h3>
                                <div id=script-executor-status></div>
                                <div id=script-executor-error></div>
                                <div id=script-executor-list-opt>
                            </div>`;
    }
    
    add_script(script)
    {
        let li = document.createElement('li');
        li.setAttribute('class', 'script-executor-container');
//        let shadow = li.attachShadow({mode: 'open'});
        
//        script.element(shadow);
        script.element(li);
        
        this._container.querySelector('#script-executor-list-opt').appendChild(li);
    }
}
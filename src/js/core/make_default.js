import {make_input} from './input/input.js';
import {App_Dispatcher_Model} from './model.js';
import {App_Dispatcher_View} from './view.js';
import {Register_ID} from './id/controller.js';
import {make_data} from './data/functions.js';
import {App_Dispatcher} from './controller.js';

const app_html = `
<div id=app-nav-bar>
    <div class=app-nav-bar-opt id=app-nav-bar-menus>
        <button id=configure_app title=Settings></button>
        <span id=profile-app-container></span>
    </div>
    <h1 id=app-title>Websocket APP</h1>
    <div class=app-nav-bar-opt id=app-nav-bar-info></div>
</div>
<my-slide-menu-hover id=options-slide-menu dir=left>
    <div id=option-container>
        <div id=server-container></div>
    </div>
</my-slide-menu-hover>
<div id=data-container></div>
<div id=input-container></div>
<div id=command-list-predefined>
    <my-retract-menu id=script-list></my-retract-menu>
</div>`;

export function make_app_dispatcher(container)
{
    container.innerHTML = app_html;
    
    const model = new App_Dispatcher_Model(make_input(container.querySelector('#input-container')), 
                                           new Register_ID(container.querySelector('#input-select-app')));
    const view = new App_Dispatcher_View(model, 
                                         new make_data(container.querySelector('#data-container')), 
                                         container.querySelector("#server-container"));
    
    return new App_Dispatcher(model, view, {
        script_container: container.querySelector('#script-list'),
        configure: container.querySelector('#configure_app'),
        profile: container.querySelector('#profile-app-container')
    });
}
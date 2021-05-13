import {App_Dispatcher} from './controller.js';
import {App_Dispatcher_Model} from './model.js';
import {App_Dispatcher_View} from './view.js';

import {make_input} from './input/input.js';
import {Register_ID} from './id/controller.js';
import {make_data} from './data/functions.js';

import {Context_Menu} from '../libs/context_menu.js';

import Window_Manager from '../components/w_manager.js';

export function make_app_dispatcher(container, options = {})
{
    let wm = new Window_Manager(container),
        context_menu = new Context_Menu();
    
    const model = new App_Dispatcher_Model(make_input(container.querySelector('#input')), 
                                           new Register_ID(container.querySelector('#input-select-app')),
                                           make_data(container.querySelector('#data'), {...{context_menu: context_menu}, ...options}),
                                          options);

    const view = new App_Dispatcher_View(model, 
                                         container.querySelector("#options"));
    
    return new App_Dispatcher(model, view, {
        win_manager: wm,
        script: container.querySelector('#scripts'),
        configure: container.querySelector('#configure'),
        profile: container.querySelector('#profile'),
        about: container.querySelector("#about"),
        install: container.querySelector('#install'),
        context_menu: context_menu
    });
}

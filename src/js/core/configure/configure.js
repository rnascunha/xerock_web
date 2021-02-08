import {Event_Emitter} from '../../libs/event_emitter.js';
import {set_selected, get_selected} from '../../helper/helpers_basic.js';

import {Configure_Events, default_profile_data, default_profile} from './types.js';
import {Type_Config} from './type_config.js';
import {Storage} from './storage_config.js';

import {Profile, Profile_Events, Profile_Rules} from './profile/model.js';

import {Data_Events} from '../data/types.js';
import {Filter_Events} from '../libs/filter/types.js';
import {Input_Events} from '../input/types.js';

export const app_config_section = `<section>Habiltar desabilitar apps</section>`;

function make_modal(id_name)
{
    let modal = document.createElement('my-modal');
    
    modal.id= id_name;
    document.body.appendChild(modal);
    
    return modal;
}

/**
* Profile: filter, select, types, custom_paint
*/

export class Configure extends Event_Emitter
{
    constructor(main_app, elements)
    {
        super();
        
        this._app = main_app;
        
        this._button = elements.button;
        this._modal = make_modal('modal-template');
        
        this._button.onclick = () => {
            this._modal.show = true;
        }
        
        this._types = new Type_Config();
        this._storage = new Storage(this._app);
        this._profile_data = default_profile_data();
                        
        this._profiles = new Profile(elements.profile);
        this._profiles.on(Profile_Events.SAVE, profile => this.save_profile(profile.name, this._profile_data, profile.rules))
                        .on(Profile_Events.LOAD, profile => this.load_profile(profile.name, profile.rules))
                        .on(Profile_Events.REMOVE, profile => this.erase_profile(profile))
                        .on(Profile_Events.DEFAULT, rules => this.load_default_profile(rules));
        
        this._app
            .on(Data_Events.POST, data => this.save_data(data))
            .on(Data_Events.CLEAR, id => this.clear_data(id))
            .on(Data_Events.CHANGE_STATE, state => {
                this._profile_data.data.state = state;
                this.save_profile(default_profile, this._profile_data, this._profiles.rules());
        })
            .on(Filter_Events.RENDER_DATA, filter => {
            this._profile_data.data.filter = filter;
            this.save_profile(default_profile, this._profile_data, this._profiles.rules());
        })
            .on(Data_Events.SELECT, selected => {
            this._profile_data.data.select = selected;
            this.save_profile(default_profile, this._profile_data, this._profiles.rules());
        })
            .on(Data_Events.CUSTOM_PAINT, config => {
            this._profile_data.data.custom_paint = config;
            this.save_profile(default_profile, this._profile_data, this._profiles.rules());
        })
            .on(Input_Events.CHANGE_STATE, state => {
            this._profile_data.input.state = state;
            this.save_profile(default_profile, this._profile_data, this._profiles.rules());
        })
            .on(Input_Events.COMMAND_LIST, list => {
            this._profile_data.input.commands_history = list;
            this.save_profile(default_profile, this._profile_data, this._profiles.rules());
        })
        this._types.on(Configure_Events.UPDATE_TYPES, state => {
            this._profile_data.configure.types = state;
            this.save_profile(default_profile, this._profile_data, this._profiles.rules());
            this.emit(Configure_Events.UPDATE_TYPES, state);
        });
        this._storage.on(Configure_Events.UPDATE_STORAGE, arg => {
            this._profile_data.configure.storage = arg;
            this.save_profile(default_profile, this._profile_data, this._profiles.rules());
        })
        
        this.render();
    }
    
    //Types
    get time(){ return this._types.time(); }
    get types(){ return this._types; }
    
    //Storage
    config_storage(state){ this._storage.config(state); }
    
    get connections(){ return this._storage.connections; }
    save_connection(id, addr, options)
    {
        this._storage.save_connection(id, addr, options); 
    }
    erase_connection(conn){ this._storage.erase_connection(conn); }
    
    save_data(data){ this._storage.save_data(data) }
    clear_data(id){ this._storage.clear_data(id); }
    
    save_profile(name, data, rules = null){ this._storage.save_profile(name, data, rules); }
    load_profile(name, rules){ this._storage.load_profile(name, rules); }
    erase_profile(name){ this._storage.erase_profile(name); }
    
    //Profiles
    get profiles(){ return this._profiles; }

    set_profile(data, rules = null)
    {
        if(rules === null || rules[Profile_Rules.types.value])
            this._profile_data.configure.types = data.configure.types;
        
        if(rules === null || rules[Profile_Rules.storage.value])
            this._profile_data.configure.storage = data.configure.storage;
        
        if(rules === null || rules[Profile_Rules.data.value])
            this._profile_data.data.state = data.data.state;
        
        if(rules === null || rules[Profile_Rules.select.value])
            this._profile_data.data.select = data.data.select;
        
        if(rules === null || rules[Profile_Rules.filter.value])
            this._profile_data.data.filter = data.data.filter;
        
        if(rules === null || rules[Profile_Rules.custom_paint.value])
            this._profile_data.data.custom_paint = data.data.custom_paint;
        
        if(rules === null || rules[Profile_Rules.input.value])
            this._profile_data.input.state = data.input.state;
        
        if(rules === null || rules[Profile_Rules.commands.value])
            this._profile_data.input.commands = data.input.commands_history;
        
        this._app.load_profile(data, rules);
    }
    
    load_default_profile(rules = null)
    {
        let data = default_profile_data();
        this.set_profile(data, rules);
    }
        
    render()
    {
        this._modal.innerHTML = `
    <div id=configure-app-container>
        <h1 id=configure-app-title>Configure</h1>
        <my-tabs id=configure-tabs background>
            <button slot=title>Types/Time</button>
            <section class=configure-section id=configure-app-type-section></section>
            <button slot=title>Storage</button>
            <section class=configure-section id=configure-app-storage-section></section>
        </my-tabs>
    </div>`;

        this._types.render(this._modal.querySelector('#configure-app-type-section'));
        this._storage.render(this._modal.querySelector('#configure-app-storage-section'));
    }
}

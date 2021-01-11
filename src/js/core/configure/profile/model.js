import {Profile_View} from './view.js'
import {Event_Emitter} from '../../../libs/event_emitter.js';

export const Profile_Events = {
    LOAD: 'load_profile',
    SAVE: 'save_profile',
    ADD: 'add_profile',
    REMOVE: 'remove_profile',
    DEFAULT: 'default_profile'
}
Object.freeze(Profile_Events);

export const Profile_Rules = {
    input: {value: 'input', name: 'Input', default: true},
    data: {value: 'data', name: 'Data', default: true},
    types: {value: 'types', name: 'Type/Time format', default: true},
    select: {value: 'select', name: 'Select', default: true},
    filter: {value: 'filter', name: 'Filter', default: true},
    custom_paint: {value: 'custom_paint', name: 'Custom Paint', default: true},
    storage: {value: 'storage', name: 'Storage', default: true},
    commands: {value: 'commands', name: 'Commands History', default: true},
}
Object.freeze(Profile_Rules);

export class Profile extends Event_Emitter
{
    constructor(container, profile_list = [])
    {
        super();
        
        this._profiles = profile_list;
        
        this._view = new Profile_View(this, container);
        
        this._view.on(Profile_Events.LOAD, profile => this.emit(Profile_Events.LOAD, profile))
                    .on(Profile_Events.SAVE, profile => this.emit(Profile_Events.SAVE, profile))
                    .on(Profile_Events.ADD, profile => this.add(profile))
                    .on(Profile_Events.REMOVE, profile => this.remove(profile))
                    .on(Profile_Events.DEFAULT, () => this.emit(Profile_Events.DEFAULT, this.rules()));
    }
    
    list()
    {
        return this._profiles;
    }
    
    rules()
    {
        return this._view.rules();
    }
    
    profile_default()
    {
        this._view.profile_default();
        this.emit(Profile_Events.DEFAULT, this.rules());
    }
    
    add(profile, update = true)
    {
        this._profiles.push(profile);
        this.emit(Profile_Events.ADD, profile);
        if(update) 
            this.emit(Profile_Events.SAVE, {name: profile, rules: {}});
    }
    
    remove(profile)
    {
        this._profiles = this._profiles.filter(p => p != profile);
        this.emit(Profile_Events.REMOVE, profile);
    }
}
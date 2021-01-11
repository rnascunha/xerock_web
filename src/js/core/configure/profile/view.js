import {Profile_Events, Profile_Rules} from './model.js';
import {Event_Emitter} from '../../../libs/event_emitter.js';

export class Profile_View extends Event_Emitter
{
    constructor(model, container)
    {
        super();
        
        this._model = model;
        this._container = container;
        this._container.innerHTML = `
<select id=profile-select-app></select>
<span id=profile-reload-app class=profile-app-icon-click></span>
<drop-menu id=profile-select-rules class=profile-app-icon></drop-menu>
<span id=profile-save-app class=profile-app-icon-click></span>
<span id=profile-delete-app class=profile-app-icon-click></span>
`;
        
        this._select = container.querySelector('#profile-select-app');
        this._reload = container.querySelector('#profile-reload-app');
        this._save = container.querySelector('#profile-save-app');
        this._delete = container.querySelector('#profile-delete-app');
        this._parts_select = container.querySelector('#profile-select-rules');
        
        this.render();
        
        this._model.on(Profile_Events.ADD, profile => this.add(profile))
                    .on(Profile_Events.REMOVE, profile => this.remove(profile))
    }
    
    render()
    {
        let current = document.createElement('option');
        current.textContent = 'Profiles';
        current.value = 'current';
        current.setAttribute('class', 'profile-select-current profile-select-option');
        this._select.appendChild(current);
        
        let new_profile = document.createElement('option');
        new_profile.textContent = 'New profile';
        new_profile.value = 'new_profile';
        new_profile.setAttribute('class', 'profile-select-new-profile profile-select-option');
        this._select.appendChild(new_profile);
        
        let clear_profile = document.createElement('option');
        clear_profile.textContent = 'Default';
        clear_profile.value = 'default';
        clear_profile.setAttribute('class', 'profile-select-default profile-select-option');
        this._select.appendChild(clear_profile);
        
        this._model._profiles.forEach(profile => {
           this.add(profile);
        });
        
        this._select.onchange = ev => {
            this.select_profile(ev);
        };
    
        this._reload.title = 'Reload profile';
        this._reload.onclick = ev => {
            this.load_profile(ev);
        }
        
        this._save.title = 'Save profile';
        this._save.onclick = ev => {
            this.save_profile(ev);
        }
        
        this._delete.title = 'Delete profile';
        this._delete.onclick = ev => {
            this.delete_profile(ev);
        }
            
        this.render_rules();
    }
    
    render_rules()
    {
        this._parts_select.innerHTML = `<span slot=title></span><lu id=profile-list-rules></lu>`;
        let el_list = this._parts_select.querySelector('#profile-list-rules');
        
        Object.keys(Profile_Rules).forEach(rule => {
            let li = document.createElement('li'),
                input = document.createElement('input'),
                label = document.createElement('label');
            
            input.type = 'checkbox';
            input.setAttribute('id', `profile-rule-${Profile_Rules[rule].value}`);
            input.setAttribute('class', 'profile-list-opt-rule');
            input.value = Profile_Rules[rule].value;
            if(Profile_Rules[rule].default) input.checked = true;
            
            label.setAttribute('for', `profile-rule-${Profile_Rules[rule].value}`);
            label.textContent = Profile_Rules[rule].name;
            label.setAttribute('class', 'profile-list-opt-label');
            
            li.appendChild(input);
            li.appendChild(label);
            el_list.appendChild(li);
        });
    }
    
    rules()
    {
        let rules_ = {};
        this._parts_select.querySelectorAll('.profile-list-opt-rule').forEach(rule => {
            rules_[rule.value] = rule.checked;
        });
        
        return rules_;
    }
    
    add(profile)
    {
        let p = document.createElement('option');
        p.textContent = profile;
        p.value = profile;
        p.classList.add('profile-select-option')
        this._select.appendChild(p);
    }
        
    remove(profile)
    {
        for(let child of this._select.children)
        {
            if(child.value === profile){
                child.remove();
                this.emit(Profile_Events.REMOVE, profile);
                return;
            }
        }
    }
    
    profile_default()
    {
        this._select.selectedIndex = 0;
    }
    
    load_profile(ev)
    {
        let value = this._select.children[this._select.selectedIndex].value;
        if(value === 'current' || value === 'new_profile' || value === 'default') return;
        
        this.emit(Profile_Events.LOAD, {name: value, rules: this.rules()});
    }
    
    delete_profile(ev)
    {
        let value = this._select.children[this._select.selectedIndex].value;
        if(value === 'current' || value === 'new_profile' || value === 'default') return;
        
        this.remove(value);
    }
    
    save_profile(ev)
    {
        let value = this._select.children[this._select.selectedIndex].value;
        if(value !== 'new_profile' || value !== 'default')
            this.emit(Profile_Events.SAVE, {name: value, rules: this.rules()});
    }
    
    select_profile(ev)
    {
        let value = this._select.children[this._select.selectedIndex].value;
        if(value === 'new_profile')
        {
            this.create_new_profile();
            return;
        }
        
        if(value !== 'current' && value !== 'default')
            this.emit(Profile_Events.LOAD, {name: value, rules: this.rules()});
        else if(value === 'default')
        {
            this.profile_default();
            this.emit(Profile_Events.DEFAULT);
        }
    }
    
    create_new_profile()
    {
        let div = document.createElement('div');
        div.setAttribute('id', 'profile-new-profile-name');
        
        let input = document.createElement('input'),
            save = document.createElement('span'),
            error = document.createElement('div');
        
        div.appendChild(input);
        div.appendChild(save);
        div.appendChild(error);
        
        save.setAttribute('id', 'profile-new-profile-name-save');
        error.setAttribute('id', 'profile-new-profile-name-error');
        
        this._container.appendChild(div);
        
        input.setAttribute('id', 'profile-new-profile-name-input');
        input.type = 'text';
        input.placeholder = 'new profile name';
        input.maxLength = 10;
        input.focus();
                
        input.onkeydown = ev => {
            if(ev.key === 'Enter') {
                div.dataset.check = true;
                input.blur();
            }
            if(ev.key === 'Escape'){
                div.dataset.check = false;
                input.blur();
            }
        }
        
        save.onclick = ev => {
            div.dataset.check = true;
        }
            
        input.onblur = ev => {
            setTimeout(() => {
                if(div.dataset.check == 'false' || div.dataset.check === undefined) {
                    div.outerHTML = '';
                    this._select.selectedIndex = 0;
                } else {            
                    if(!this.save_new_profile(input, error, div)) input.focus();
                }
            }, 100);
        }
    }
    
    save_new_profile(input, error, div)
    {
        if(input.value.length === 0)
        {
            error.textContent = 'Empty profile name';
            return false;   
        }
        
        if(input.value.toLowerCase() === 'current' || 
           input.value.toLowerCase() === 'new_profile' ||
           input.value.toLowerCase() === 'default')
        {
            error.textContent = `Invalid restricted profile name ("${input.value}")`;
            return false;   
        }
        
        let profile = this._model._profiles.find(p => p.toLowerCase() === input.value.toLowerCase());
        if(profile)
        {
            error.textContent = `Profile already exist ("${input.value}")`;
            return false;   
        }
        
        this.emit(Profile_Events.ADD, input.value);
        this._select.selectedIndex = this._select.children.length - 1;
        
        div.outerHTML = '';
        return true;
    }
}

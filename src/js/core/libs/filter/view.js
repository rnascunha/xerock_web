import {Event_Emitter} from '../../../libs/event_emitter.js';
import {Filter_Events, filter_default_opts, filter_option_list} from './types.js';
import {Message_Direction, Message_Type, Control_Type} from '../message_factory.js';
import {html_template} from './html.js';
import {event_path} from '../../../helper/compatibility.js';

export class Filter_View extends Event_Emitter
{
    constructor(model, container, opts = {})
    {
        super();
        
        this._model = model;
        this._container = container;
        
        let shadowRoot = this._container.attachShadow({mode: 'open'});
        shadowRoot.appendChild(html_template.content.cloneNode(true));
        
        this._filter_container = shadowRoot.querySelector('#filter-list');
        
        let filter_opts = {...filter_default_opts, ...opts};
        
        this._recursevely_check = null;
        this._unselect_check = null;
        if(filter_opts.commands)
            this._make_filter_commands(filter_opts, shadowRoot);

        if(!filter_opts.recursive)
            this._recursevely_check = { checked: Boolean(filter_opts.recursive_checked)};
        if(!filter_opts.unselect)
            this._unselect_check = { checked: Boolean(filter_opts.unselect_check) };
        
        this._model.on(Filter_Events.RENDER_FILTER, opts => {
            this._check_new_opts();
            this._add_sid_options();
        })
            .on(Filter_Events.SET_FILTER, filter => {
            this._check_set_filters();
            this._check_set_sid_filters();
        });
        
        this.render();
    }
    
    render()
    {                
        let options = this._model.filter_options();

        Object.keys(filter_option_list).forEach(opt => {
            if(options[opt] instanceof Array)
            {
                let span = document.createElement('span');
                span.id = `filter-${opt}`;
                span.classList.add('filter-row-attr');
                span.title = filter_option_list[opt].description;
                
                options[opt].forEach(op => this._add_property(opt, op, span))
                
                this._filter_container.appendChild(span);
            }
        });
        
        this._add_sid_options();
        
        this._filter_container.addEventListener('click', ev => {
            let path = event_path(ev);
            
            if('value' in path[0].dataset)
            {
                let data = JSON.parse(path[0].dataset.value);
                this.select(path[0].classList.contains('filter-selected') ? 'remove' : 'add',
                           data.prop, data.value);
            }
        })
    }
    
    select(act, prop, value)
    {
        this.emit(this.emit(Filter_Events.SET_FILTER, {input: value, 
                                                         key: prop, 
                                                         act: act, 
                                                         recursevely: this._recursevely_check.checked,
                                                         unselect: this._unselect_check.checked }))
    }
    
    _add_sid_sessions(sid)
    {
        let options = this._model.filter_options();
        
        if(!(sid in options.session)) return;
        let session_containter = this._filter_container.querySelector(`#filter-sid${sid}-session`);
        if(!session_containter) return;
        
        let values = Array.from(session_containter.values());
        options.session[sid].forEach(session => {
            let checkbox = values.find(s => s.value === `${session}`);
            if(!checkbox)
            {
                let label = session_containter.add_checkbox(session);
                checkbox = label.querySelector('input');
            }
            checkbox.checked = this._model.is_selected(['session', sid], session) ? true : false;
        });      
    }
    
    _add_sid_options()
    {
        let options = this._model.filter_options();
        
        Object.keys(options.sid).forEach(sid => {
            let sid_container = this._filter_container.querySelector(`#filter-sid${sid}`),
                app_container;
            
            if(!sid_container)
            {
                sid_container = document.createElement('span');
                sid_container.classList.add('filter-row-attr');
                sid_container.id = `filter-sid${sid}`;
                
                let sid_btn = document.createElement('button');
                sid_btn.classList.add('filter-button', 'filter-button-sid');
                sid_btn.textContent = sid;
                sid_btn.dataset.value = JSON.stringify({prop: ['sid'], value: sid});
                
                this._check_selected(['sid'], sid, sid_btn);
                
                sid_container.appendChild(sid_btn);
                
                //Session
                let session_select = document.createElement('select-checkbox');
                session_select.label = '#';
                session_select.title = `${sid}'s sessions`;
                session_select.id = `filter-sid${sid}-session`;
                
                session_select.addEventListener('change', ev => {
                    let path = event_path(ev.detail);
                    this.select(path[0].checked ? 'add' : 'remove',
                           ['session', sid], path[0].value)
                });
                
                app_container = document.createElement('span');
                app_container.classList.add('filter-sid-app');

                sid_container.appendChild(session_select);
                sid_container.appendChild(app_container);
                this._filter_container.appendChild(sid_container);
            } else 
                app_container = sid_container.querySelector('.filter-sid-app');
            
            this._add_sid_sessions(sid);

           this._add_sid_app(options, sid, app_container);
        });
    }
    
    _add_sid_app(options, sid, container)
    {
        Object.keys(options.sid[sid]).forEach(app => {            
            let id_container = container.querySelector(`#filter-sid${sid}-app-${app}`);
            if(!id_container)
            {
                id_container = document.createElement('span');
                id_container.id = `filter-sid${sid}-app-${app}`;
                id_container.classList.add('filter-sid-app-id');
                
                let app_btn = document.createElement('button');
                app_btn.classList.add('filter-button', 'filter-button-app');
                app_btn.textContent = app;
                app_btn.dataset.value = JSON.stringify({prop: ['app', sid], value: app});
                
                this._check_selected(['app', sid], app, app_btn);

                id_container.appendChild(app_btn);

                container.appendChild(id_container);
            } 
            this._add_sid_app_id(options, sid, app, id_container)
        });
    }
    
    _add_sid_app_id(options, sid, app, container)
    {
        options.sid[sid][app].forEach(id => {
            let id_btn = container.querySelector(`[data-id='${id}']`);

            if(!id_btn)
            {
                id_btn = document.createElement('button');
                id_btn.classList.add('filter-button', 'filter-button-id', `filter-sid${sid}-app-${app}`);
                id_btn.textContent = id;
                id_btn.dataset.value = JSON.stringify({prop: ['id', sid, app], value: id});
                id_btn.dataset.id = id;

                this._check_selected(['id', sid, app], id, id_btn);
                
                container.appendChild(id_btn);
            }
        });
    }
            
    _add_property(prop, value, container)
    {
        if(container.querySelector(`#filter-${prop}-${value}`)) return;
        
        let button = document.createElement('button');
        button.id = `filter-${prop}-${value}`;
        button.classList.add('filter-button');
        button.textContent = this._get_text(prop, value);
        
        button.dataset.value = JSON.stringify({prop: [prop], value: value});
        
        this._check_selected([prop], value, button);
        
        container.appendChild(button);
    }
        
    _get_text(prop, value)
    {
        switch(prop)
        {
            case filter_option_list.dir.value:
                return Message_Direction[value].name;
            case filter_option_list.type.value:
                return Message_Type[value].name;
            case filter_option_list.ctype.value:
                return Control_Type[value].name;
            default:
        }
        
        return value;
    }
    
    _check_selected(prop, value, element)
    {
        if(this._model.is_selected(prop, value))
        {
            element.classList.add('filter-selected');
            element.classList.remove('filter-unselected');
        } else {
            element.classList.add('filter-unselected');
            element.classList.remove('filter-selected');
        }
    }
    
    _check_new_opts()
    {
        let opts = this._model.filter_options();
        Object.keys(opts).forEach(opt => {
            if(opts[opt] instanceof Array)
            {
                let span = this._filter_container.querySelector(`#filter-${opt}`);
                if(span)
                    opts[opt].forEach(op => this._add_property(opt, op, span))
            }
        });
    }
    
    _check_set_filters()
    {
        let opts = this._model._filter_opts;
             
        Object.keys(opts).forEach(prop => {
           if(opts[prop] instanceof Array)
           {
               let cont = this._filter_container.querySelector(`#filter-${prop}`);
               if(!cont) return;
               
               cont.querySelectorAll('[data-value]').forEach(el => {
                   let data = JSON.parse(el.dataset.value);
                   this._check_selected(data.prop, data.value, el);
               });
           }
        });
    }
    
    _check_set_sid_filters()
    {
        let options = this._model._filter_opts;
        Object.keys(options.sid).forEach(sid => {
            let cont = this._filter_container.querySelector(`#filter-sid${sid}`);
            if(!cont) return;
            
            cont.querySelectorAll('[data-value]').forEach(el => {
                let data = JSON.parse(el.dataset.value);
                this._check_selected(data.prop, data.value, el);
            });
        });
    }
           
    _make_filter_commands(options, shadow)
    {
        
        let div = document.createElement('div');//this._container.querySelector('.filter-commands');
        div.id = 'filter-commands';
        shadow.appendChild(div);
        
        if(options.clear)
        {
            let clear_button = document.createElement('button');
            clear_button.textContent = 'clear';
            clear_button.addEventListener('click', ev => this.emit(Filter_Events.SET_FILTER, {act: 'clear'}));
            div.appendChild(clear_button);
        }
        
        if(options.recursive)
        {
            let label = document.createElement('label');
            label.innerHTML = '<input type=checkbox class=filter-recursevely-check>Recursive';
            this._recursevely_check = label.querySelector('.filter-recursevely-check');
            this._recursevely_check.checked = Boolean(options.recursive_checked);
            
            div.appendChild(label);
        }
        
        if(options.unselect)
        {
            let label = document.createElement('label');
            label.innerHTML = '<input type=checkbox class=filter-unselect-check>Unselect';
            this._unselect_check = label.querySelector('.filter-unselect-check');
            this._unselect_check.checked = Boolean(options.unselect_checked);
            
            div.appendChild(label);
        }
    }
}
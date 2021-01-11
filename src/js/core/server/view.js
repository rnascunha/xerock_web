import {Event_Emitter} from '../../libs/event_emitter.js';
import {Server_Events} from './types.js';

import style from './server.css';

const template = document.createElement('template');
template.innerHTML = `
<my-retract-menu class=server-container>
    <h3 slot=title class=title-container>
        <span class=server-title-name></span>
        <span class=server-title-options>
            <input class=autoconnect-checkbox type=checkbox title=Autoconnect>
            <span class=edit-name title='Edit name'>&#x270E;</span>
            <span class=close title='Close connection'>&times;</span>
        </span>
    </h3>
    <div class=container>
        <div>
            <span class=status>
                <span class=server-id title='Server ID'>ID: </span><span class=server-id-value>-</span> | 
                <span class=users title='User ID / Total users connected'>&#x1F464;: </span>
                <span class=user-id title='User ID'></span> / <span class=total-users title='Total users'></span> |
                <span title='Server Session'>Session:</span><span class=server-session-value></span><span class=server-session-add></span>
            </span>
        </div>
        <my-retract-menu id=app-container-list>
            <h4 slot=title><hr title=Apps></h4>
            <div class=container-apps></div>
        </my-retract-menu>
    </div>
</my-retract-menu>`;

export class Server_View extends Event_Emitter
{
    constructor(model)
    {
        super();
        
        this._model = model;        
        this._raw_container = null;
        this._container = null;
        
        this._model.on(Server_Events.STATUS_MESSAGE, arg => this.status(arg))
                    .on(Server_Events.CLOSE, () => this.close())
                    .on(Server_Events.SERVER_NAME_CHANGE, name => this.server_name(name))
                    .on(Server_Events.SET_AUTOCONNECT, enable_auto => this.autoconnect(enable_auto))
                    .on(Server_Events.ADD_APP, args => this.add_app(args))
                    .on(Server_Events.UPDATE_SESSION, session => this.update_session(session));
    }
    
    render(container)
    {
        this._raw_container = container;
        this._container = container.attachShadow({mode: 'open'});
        
        const style_el = document.createElement('style');
        style_el.innerHTML = style.toString(); 
        
        this._container.appendChild(style_el);
        this._container.appendChild(template.content.cloneNode(true));
        
        this.server_name();
        
        this._container.querySelector('.close').onclick = ev => {
            this.emit(Server_Events.CLOSE);
        }
        
        let autoconnect = this._container.querySelector('.autoconnect-checkbox');
        autoconnect.onclick = ev => {
            ev.stopPropagation();
            this.emit(Server_Events.SET_AUTOCONNECT, autoconnect.checked)
        }
        this.autoconnect();
        
        let session = this._container.querySelector('.server-session-add').onclick = ev => {
            this.emit(Server_Events.UPDATE_SESSION);
        }
        this.update_session(this._model.session);
        
        this._container.querySelector('.server-id-value').textContent = this._model.id();
        
        this.edit_name();
        
        this._container.querySelector('.server-container').show = false;
    }
    
    edit_name()
    {
        this._container.querySelector('.edit-name').onclick = ev => {
            ev.stopPropagation();
            let title = this._container.querySelector('.server-title-name');
            title.contentEditable = true;
            title.textContent = this._model.name();
            title.focus();
            
            title.onblur = ev => {
                title.contentEditable = false;
                if(!title.textContent)
                    title.textContent = this._model.addr();
                    
                this.emit(Server_Events.SERVER_NAME_CHANGE, title.textContent);
            }
        }
        
        this._container.querySelector('.server-title-name').title = this._model.addr();
    }
    
    autoconnect(enable)
    {
        this._container.querySelector('.autoconnect-checkbox').checked = this._model.autoconnect();
    }
    
    update_session(session)
    {
        this._container.querySelector('.server-session-value').textContent = session;
    }
    
    server_name(name)
    {
        let name_container = this._container.querySelector('.server-title-name');
        if(this._model.name())
        {
            name_container.innerHTML = `<span>${this._model.name()} </span>
                                        <span style=font-size:12px>(${this._model.addr()})</span>`
        } else
            name_container.textContent = this._model.addr();
    }
    
    status(arg)
    {
        this._container.querySelector('.user-id').textContent = this._model.user_id() < 0 ? 
                                                                    '-' : this._model.user_id();
        this._container.querySelector('.total-users').textContent = this._model.user_number() < 0 ? 
                                                                        '-' : this._model.user_number();
    }
    
    config(arg)
    {
        let app_container = this._container.querySelector('.container-apps'),
            lu = document.createElement('lu');
        
        arg.forEach(app => {
            let li = document.createElement('li');
            li.textContent = app;
            
            lu.appendChild(li);
        });
        
        app_container.appendChild(lu);
    }
    
    close()
    {
        if(this._raw_container)
            this._raw_container.outerHTML = '';
        
        this._raw_container = null;
        this._container = null;
    }
    
    add_app(args)
    {
        if('container' in args.opt 
           && args.opt.container === false)
            return;
        
        let container = this._container.querySelector('.container-apps'),
            new_app = document.createElement('my-retract-menu');
        
        new_app.classList.add('app-container');
        new_app.show = false;
        
        new_app.innerHTML = `<h4 slot=title>${args.app.long_name()}</h4>
                            <div class=app></div>`;
        
        let app_container = new_app.querySelector('.app');
        
        args.app.render(app_container.attachShadow({mode: 'open'}));
        
        container.appendChild(new_app);
    }
    
//    append(app_container)
//    {
//        this._container.querySelector('.container-apps').appendChild(app_container);
//    }
}
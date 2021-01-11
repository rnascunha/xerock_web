import {Event_Emitter} from '../../libs/event_emitter.js';
import {make_filter, dispatch_filter_events, make_sid_filter} from '../libs/filter/functions.js';
import {Filter_Events} from '../libs/filter/types.js';
import {App_Events} from '../types.js';
import {Profile_Rules} from './profile/model.js';
import * as Storage_DB from '../../libs/storage.js';
import {local_server} from '../server/local_server.js';
import {Configure_Events, default_profile_data, default_profile} from './types.js';

const html = `
<h4>Save Data</h3>
<section class=storage-config-section>
    <label><input type=checkbox id=storage-save-data-check>Save Data</label>;
    <div id=storage-save-data></div>
</section>
<h4>Clear data</h4>
<section class=storage-config-section>
    <div id=storage-clear-data></div>
    <hr>
    <button id=storage-clear-button>Clear data</button><label><input id=storage-clear-check type=checkbox checked>Erase from storage</label>
</section>
<h4>Connections</h3>
<section class=storage-config-section>
    <table>
        <tr><th>ID</th><th>Address</th><th>Name</th><th>Autoconnect</th><th>Session</th><th>Status</th><th>#</th></tr>
        <tbody id=storage-connection></tbody>
    </table>
</section>
<h4>Profiles</h3>
<section class=storage-config-section>
    <table id=storage-profiles>
        <tr><th>Name</th><th>#</th></tr>
        <tbody id=storage-profile></tbody>
    </table>
</section>
<hr>
<section class=storage-config-section>
    <button id=storage-clear-all-button>Clear all data</button>
</section>`;


const db_name = 'app_database';
const db_version = 1;
const db_scheme = [
    {name: 'profile', options: { keyPath: "profile" }},
    {name: 'connection', options: { keyPath: 'addr'}},
    {name: 'data', options: {autoIncrement: true}}
];

export class Storage extends Event_Emitter
{
    constructor()
    {
        super();
        
        this._save_data_filter = null;
        this._save_data_check = null;
        
        this._clear_data_filter = null;
        this._container = null;
                
        this._storage_connections = null;
        this._connections = {};
        
        this._storage_profiles = null;
        
        this._storage = new Storage_DB.default(db_name, db_version, db_scheme)
                                .on_open(this._init.bind(this), default_profile);
        
        window.app.on(App_Events.CLOSE_SERVER, arg => this._render_connection())
                    .on(App_Events.SERVER_CONNECTED, server => this._render_connection());
        
    }
    
    config(state)
    {
        this._save_data_check.checked = state.save;
        this._save_data_filter.update(state.filter);
    }
    
    clear_all()
    {
        window.app.data.clear(true);
        this.clear_connections();
        this.clear_profile();
    }
            
    /*
    * Data
    */
    save_data(data)
    {
        if(this._save_data_check.checked && this._save_data_filter.filter(data.data))
            this._storage.save('data', data.data, this._save_data_handler.bind(this, data));
    }
        
    clear_data(id)
    {
        if(id){
            this._storage.erase('data', id);
            return;
        }
        this._storage.clear('data');
    }
    
    _save_data_handler(data, ev)
    {
        data.id = ev.target.result;
    }
        
    _load_data(cursor)
    {
        window.app.data.prepend(cursor.value, cursor.primaryKey);
        return true;
    }
    
    /*
    * Profile
    */    
    save_profile(name, data, rules = null)
    {
        data.profile = name;
        this._storage.save('profile', data);
        this._render_profile();
    }
        
    load_profile(name, rules = null)
    {
        this._storage.load('profile', name, data => {
            window.app.configure().set_profile(data, rules);
        });
    }
    
    erase_profile(name)
    {
        this._storage.erase('profile', name);
        this._render_profile();
    }
    
    clear_profile()
    {
        this._storage.clear('profile');
        this._render_profile();
    }
    
    _load_profiles(cursor, list)
    {
        if(cursor.key != 'current')
            list.add(cursor.key, false);
    
        this._render_profile();
        
        return true;
    }
    
    /**
    * Connection
    */
    get connections(){ return this._connections; }
    
    save_connection(id, addr, options)
    {
        let conn = {addr: addr, id: id, options: options};
        this._storage.save('connection', conn);
        this._connections[addr] = conn;
        this._render_connection(conn);
    }
    
    erase_connection(conn)
    {
        window.app.data.clear_filter(make_sid_filter(conn.id), true);
        if(conn.id != local_server.id()) this._set_autoconnect(conn, false);
        
        this._storage.erase('connection', conn.addr);
        delete this._connections[conn.addr];
        this._render_connection(conn);
    }
    
    clear_connections()
    {
        this._storage.iterate('connection', null, 'next', this._erase_connection.bind(this));
    }
    
    _erase_connection(cursor)
    {
        this.erase_connection(cursor.value);
        
        return true;
    }
    
    _load_connection(cursor)
    {
        if(cursor.value.id != local_server.id())
            window.app.add_connection(cursor.value.id, 
                                      cursor.value.addr,
                                      cursor.value.options,
                                      cursor.value.options.autoconnect);
        else
            local_server.load_connection(cursor.value.id, cursor.value.addr, cursor.value.options);
        
        this._connections[cursor.value.addr] = {
            addr: cursor.value.addr,
            id: cursor.value.id,
            options: cursor.value.options
        }
        this._render_connection(this._connections[cursor.value.addr]);
        
        return true;
    }
    
    /*
    *
    */
    render(container)
    {
        this._container = container;
        this._container.innerHTML = html;
        
        this._save_data_check = this._container.querySelector('#storage-save-data-check');
        
        this._save_data_check.checked = default_profile_data().configure.storage.save;
        this._save_data_filter = make_filter(this._container.querySelector('#storage-save-data'), 
                                             null, 
                                             default_profile_data().configure.storage.filter);
        dispatch_filter_events(Filter_Events.RENDER_FILTER, filter_opts => this._save_data_filter.filter_options(filter_opts));
        
        this._save_data_check.addEventListener('change', ev => {
            this.emit(Configure_Events.UPDATE_STORAGE, {
                save: this._save_data_check.checked,
                filter: this._save_data_filter.get()
            });
        });
        this._save_data_filter.on(Filter_Events.RENDER_DATA, filter => {
            this.emit(Configure_Events.UPDATE_STORAGE, {
                save: this._save_data_check.checked,
                filter: this._save_data_filter.get()
            });
        });
                
        this._clear_data_filter = make_filter(this._container.querySelector('#storage-clear-data'));
        dispatch_filter_events(Filter_Events.RENDER_FILTER, filter_opts => this._clear_data_filter.filter_options(filter_opts));
        
        this._container.querySelector('#storage-clear-button').addEventListener('click', ev => {
            window.app.data.clear_filter(this._clear_data_filter.get(), 
                                    this._container.querySelector('#storage-clear-check').checked);
        });
        
        this._container.querySelector('#storage-clear-all-button')
                            .addEventListener('click', this.clear_all.bind(this));
        
        this._storage_connections = this._container.querySelector('#storage-connection');
        this._storage_profiles = this._container.querySelector('#storage-profile');
    }
    
    _init(target, profile_name)
    {
        this._storage.add('connection', { 
                                        addr: local_server.addr(), 
                                        id: local_server.id(),
                                        options:  {
                                            name: local_server.name(), 
                                            session: local_server.session
                                        }                                        
                                    });
        
        this.load_profile(profile_name);
        this._storage.iterate('profile', null, 'next', this._load_profiles.bind(this), window.app.configure().profiles);
        this._storage.iterate('data', null, 'prev', this._load_data.bind(this));
        this._storage.iterate('connection', null, 'next', this._load_connection.bind(this));
    }
    
    _render_profile()
    {
        let profiles = window.app.configure().profiles.list();
     
        this._storage_profiles.innerHTML = '';
        if(!profiles.length)
            this._storage_profiles.innerHTML = `<tr><td colspan=2 style='font-style:italic;'>No profiles saved</td></tr>`;
        else {
            profiles.forEach(profile => {
                let line = document.createElement('tr');
                line.innerHTML = `<td>${profile}</td><td class=close-storage-connection></td>`;
                line.classList.add('storage-conneciton');
                
                line.querySelector('.close-storage-connection').addEventListener('click', ev => {
                    window.app.configure().profiles.remove(profile);
                });
                
                this._storage_profiles.appendChild(line);
            });
        }
    }
    
    _render_connection()
    {
        this._storage_connections.innerHTML = '';
        if(!Object.values(this._connections).length)
            this._storage_connections.innerHTML = `<tr><td colspan=7 style='font-style:italic;'>No connections saved</td></tr>`;
        else
            Object.values(this._connections).forEach(conn => {
                let line = document.createElement('tr');
                line.classList.add('storage-conneciton');

                if(conn.id === local_server.id())
                    line.innerHTML = `<td>${conn.id}</td>
        <td>${conn.addr}</td>
        <td>${conn.options.name}</td>
        <td>-</td>
        <td>${conn.options.session}</td>
        <td class=storage-conn-connected></td>
        <td class=close-storage-connection></td>`;
                else{
                    line.innerHTML = `
        <td>${conn.id}</td>
        <td>${conn.addr}</td>
        <td>${conn.options.name}</td>
        <td><input class=storage-config-auto-connect type=checkbox ${conn.options.autoconnect ? 'checked' : ''}></td>
        <td>${conn.options.session}</td>
        <td class=${conn.addr in window.app.servers ? 'storage-conn-connected' : 'storage-conn-disconnected'}></td>
        <td class=close-storage-connection title='Clear all data from server'></td>`;

                    line.querySelector('.storage-config-auto-connect').addEventListener('change', this._autoconnect_cb.bind(this, conn));
                }
                line.querySelector('.close-storage-connection').addEventListener('click', this.erase_connection.bind(this, conn));

                this._storage_connections.appendChild(line);
            });
    }
    
    _autoconnect_cb(conn, ev){ this._set_autoconnect(conn, ev.target.checked); }
    _set_autoconnect(conn, check)
    {
        if(conn.addr in window.app.servers) 
            window.app.servers[conn.addr].autoconnect(check);
        else {
            conn.options.autoconnect = check;
            this.save_connection(conn.id, conn.addr, conn.options);
        }
    }
}
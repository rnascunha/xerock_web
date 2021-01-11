import {curry} from '../helper/util.js'

export default class Storage
{
    constructor(db_name, version, scheme)
    {
        this._db = null;
        
        if(!indexedDB){
            console.error('Storage IndexDB not supported');
            return null;
        }
                
        let open_req = indexedDB.open(db_name, version);
        
        open_req.onerror = this._open_error.bind(this);
        open_req.onsuccess = this._open.bind(this);
        open_req.onblocked = this._blocked.bind(this);
        open_req.onupgradeneeded = ev => {
            this._onupgrade(ev, scheme);
        }
        
        this._on_open = null;
    }
    
    on_open(callback, ...args)
    {
        this._on_open = curry(callback, ...args);
        
        return this;
    }
    
    add(object_store, data, erro_cb = null)
    {
        if(!this._db) return;

        let transaction = this._db.transaction(object_store, 'readwrite');
                
        transaction.onerror = ev => {
            if(erro_cb != null) {
                error_cb(ev);
            }
            ev.stopImmediatePropagation();
        }
        
        transaction.objectStore(object_store).add(data);
    }
    
    save(object_store, data, success = null, error = null)
    {
        if(!this._db) return;
        
        let request = this._db.transaction(object_store, 'readwrite').objectStore(object_store).put(data);
        request.onsuccess = ev => {
            if(success !== null) success(ev);
        }
        
        request.onerror = ev => {
            if(error !== null) error(ev);
        }
    }
    
    load(object_store, key, callback, error = null)
    {
        if(!this._db) return;
     
        let request = this._db
                        .transaction(object_store)
                            .objectStore(object_store)
                                .get(key);
                  
        request.onsuccess = ev => {
            if(ev.target.result)
                callback(ev.target.result);
        }
        
        if(error){
            request.onerror = ev => {
                error(ev);
            }
        }
    }
    
    erase(object_store, key)
    {
        this._db.
            transaction(object_store, 'readwrite').
                objectStore(object_store).
                    delete(key);
    }
    
    clear(object_store)
    {
        this._db.
            transaction(object_store, 'readwrite').
                objectStore(object_store).
                    clear();
    }
    
    iterate(object_store, range, direction, callback, ...args)
    {
        this._db.
            transaction(object_store).
                objectStore(object_store).
                    openCursor(range, direction).onsuccess = ev => {
            let cursor = ev.target.result;
            if(cursor)
                if(callback(cursor, ...args)) cursor.continue();
        }
    }
    
    _open(event)
    {
        this._db = event.target.result;

        this._db.onerror = ev_error => {
            console.error("DB error", ev_error.target.error.code, ev_error.target.error.message);
        };
        
        this._db.onversionchange = event => {
            this._db.close();
            console.log("A new version of this page is ready. Please reload or close this tab!");
        };
        
        if(this._on_open)
            this._on_open(event.target);
    }
        
    _onupgrade(event, scheme)
    {
        console.assert(scheme instanceof Array, 'Argument "scheme" must be of type Array')
        
        this._db = event.target.result;

        scheme.forEach(object_store => {
            this._db.createObjectStore(object_store.name, object_store.options);    
        });
    }
    
    _blocked(event)
    {
        console.log("Please close all other tabs with this site open!");
    }
    
    _open_error(event)
    {
        console.error('Error opening db', event.target.error.code, event.target.error.message, event);
    }
}
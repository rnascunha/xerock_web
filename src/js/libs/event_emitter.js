
export class Event_Emitter {
    constructor() {
        this._events = {};
    }
    
    on(evt, listener) {
        (this._events[evt] || (this._events[evt] = [])).push(listener);
        return this;
    }
    
    emit(evt, arg) {
        (this._events[evt] || []).slice().forEach(lsn => lsn(arg));
    }
    
    clean(){
        this._events = {};
    }
}
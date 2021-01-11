import {Event_Emitter} from '../../../libs/event_emitter.js';
import {Input_Events} from '../types.js';
import {Hitory_Commands_View} from './view.js';

export class History_Commands extends Event_Emitter
{
    constructor(container, max_comm = 0){
        super();
        
        console.assert(typeof max_comm === 'number' && max_comm >= 0, "'max_comm' must be a interger and equal/greater then zero");
        
        this._recent_list = [];
        this._max_comm = max_comm;
        this._index = -1;
        
        this._view = new Hitory_Commands_View(this, container);
    }
    
    list(list = null)
    {
        if(list !== null)
        {
            this._recent_list = list;
            this.emit('render');
        }
        return this._recent_list;
    }
    
    remove(index)
    {
        this._recent_list = this._recent_list.filter((c, i) => index !== i);
        this.emit('render');
    }
    
    add(comm, type){
        let new_comm = {data: comm, type: type};
        this._recent_list = this._recent_list.filter(c => !this.compare(c, new_comm));
        
        this._recent_list.push(new_comm);
        if(this._max_comm){
            if(this._recent_list.length > this._max_comm){
                this._recent_list = this._recent_list.slice(-this._max_comm, this._max_comm);
            }
        }
        this._index = this._recent_list.length - 1;
        
        this.emit('render');
    }
    
    next(){
        if(this._recent_list.length === 0) return undefined;
        
        if(++this._index == this._recent_list.length) --this._index;
        let comm = this._recent_list[this._index];
        
        this.emit('set index', this._index);
        
        return comm;
    }
    
    previous(){
        if(this._recent_list.length === 0) return undefined;

        if(--this._index == -1) this._index = 0;
        let comm = this._recent_list[this._index];

        this.emit('set index', this._index);
        
        return comm;
    }
    
    set(idx, send = false){
        if(!(idx >= 0 && idx < this._recent_list.length)) return;
        this._index = idx;

        this.emit('set index', this._index);
        
        if(send){
            this.emit(Input_Events.SEND_INPUT, this._recent_list[idx]);
        } else {
            this.emit(Input_Events.SET_INPUT, this._recent_list[idx]);
        }
    }
    
    compare(comm1, comm2){
        return comm1.data == comm2.data && comm1.type == comm2.type;
    }
}
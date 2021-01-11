import {Event_Emitter} from '../../../libs/event_emitter.js';
import {columns_all, columns_default, Select_Events, Set_Select_Type} from './types.js';

export class Select_Model extends Event_Emitter
{
    constructor(selected, columns = columns_all)
    {
        super();
        
        this._columns = columns;
        this._selected = selected || columns_default;
    }
    
    columns()
    {
        return this._columns;
    }
    
    select(selected = null, emit = true)
    {
        if(selected){
            this._selected = selected;
            this.emit(Select_Events.SET_SELECTED, this._selected);
            if(emit)
                this.emit(Select_Events.RENDER_DATA, this._selected);
        }
        return this._selected;
    }
    
    is_selected(column)
    {
        return Select_Model.is_selected(this._selected, column);
    }
    
    static is_selected(columns, column)
    {
        return columns.findIndex(c => c == column) !== -1;
    }
    
    set_select(type, column)
    {        
        if(type == Set_Select_Type.ADD) this.add(column);
        else this.remove(column);
    }
    
    add(column)
    {
        if(this._columns.findIndex(e => e == column) === -1) return;
        if(this._selected.findIndex(e => e == column) !== -1) return;
        
        //must put at the right place
        let new_sel = []
        this._columns.forEach(c => {
            if(this._selected.findIndex(e => e == c) !== -1 || c == column) new_sel.push(c);
        });
        
        this._selected = new_sel;
        this.emit(Select_Events.SET_SELECTED, this._selected);
        this.emit(Select_Events.RENDER_DATA, this._selected);
    }
    
    remove(column)
    {
        if(this._columns.findIndex(e => e == column) === -1) return;
        this._selected = this._selected.filter(e => e != column);
        
        this.emit(Select_Events.SET_SELECTED, this._selected);
        this.emit(Select_Events.RENDER_DATA, this._selected);
    }
}
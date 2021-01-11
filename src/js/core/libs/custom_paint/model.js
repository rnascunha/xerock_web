import {Event_Emitter} from '../../../libs/event_emitter.js';
import {Output_Filter} from './output_filter.js';
import {Output_Style_View} from './view.js';
import {Filter} from '../../libs/filter/controller.js';
import {copy} from '../../../helper/object_op.js';

import {make_filter} from '../../libs/filter/functions.js';
import {Filter_Events} from '../../libs/filter/types.js';

import * as Types from './types.js';
import {Output_Style_Events} from './types.js';

export function make_custom_filter_prefix(id)
{
    return Types.filter_custom_class_prefix + id;
}

export class Output_Style extends Event_Emitter
{
    constructor(container, defaulte = null, hover = null, custom = [])
    {
        super();
        
        this._default = null;
        this._hover = null;
        
        this.defaulte(defaulte || Types.default_filter)
        
        this.hover(hover || Types.default_filter_hover);
        
        this._custom = custom;
        this._filter_id = 0;

        this._view = new Output_Style_View(this, container);
        this._view.on(Output_Style_Events.ADD_CUSTOM, () => this.add_custom())
                    .on(Output_Style_Events.REMOVE_CUSTOM, id => this.remove_custom(id))
//                    .on(Output_Style_Events.CHANGE_STYLE_VIEW, () => this.emit(Output_Style_Events.CHANGE_STYLE_VIEW))
//                    .on('render_data', () => this.emit('render_data'));
    }
        
    render()
    {
        this._view.render();
    }
    
    filter(msg){
        let filter = this._custom.find(f => Filter.filter(f.filter(), msg));
        
        if(filter) return make_custom_filter_prefix(filter.id());
        return Types.filter_default_class;
    }
    
    set_class(el, class_name){
        el.classList.forEach(c => {
            let sub = c.substring(0, Types.filter_custom_class_prefix.length);
            if(sub == Types.filter_custom_class_prefix)
                el.classList.remove(c);
        });
        
        el.classList.add(class_name);
    }
    
    filter_set(msg, el){
        el.classList.add(Types.filter_default_class);
        this.set_class(el, this.filter(msg));
    }
    
    defaulte(style = null, save = true)
    {
        if(style){
            if(this._default) this._default.remove();
            this._default = new Output_Filter('default', '.' + Types.filter_default_class, style);
            if(save)
                this.emit(Output_Style_Events.CHANGE_STYLE, {type: Types.Output_Style_Type.DEFAULT, 
                                                         style: this._default});
            this._default.on(Output_Style_Events.CHANGE_STYLE_VIEW, 
                             () => this.emit(Output_Style_Events.CHANGE_STYLE_VIEW));
        }
        
        return this._default;
    }
    
    hover(style = null, save = true)
    {
        if(style){
            if(this._hover) this._hover.remove();
            this._hover = new Output_Filter('default-hover', '.' + Types.filter_default_class + ':hover', style);
            if(save)
                this.emit(Output_Style_Events.CHANGE_STYLE, {type: Types.Output_Style_Type.HOVER, 
                                                         style: this._hover});
            this._hover.on(Output_Style_Events.CHANGE_STYLE_VIEW, 
                             () => this.emit(Output_Style_Events.CHANGE_STYLE_VIEW));
        }
        
        return this._hover;
    }
    
    custom(index, style = null, filter = null)
    {
        console.assert(index < this._custom.length, 'Out of bounds index');
        
        if(style || filter)
        {
            if(this._custom[index]) this._custom[index].remove();
            this._custom[index] = this._make_custom_output_filter(this._filter_id, style, filter);
            this.emit(Output_Style_Events.CHANGE_STYLE, {type: Output_Style_Type.CUSTOM, 
                                                     index: index,
                                                     style: this._custom[index]});
        }
        
        return this._custom[index];
    }
    
    config(data = null, save = true)
    {
        if(data)
        {
            if(data.hasOwnProperty('default'))
                this.defaulte(copy(data.default), save);
            if(data.hasOwnProperty('hover'), save)
                this.hover(copy(data.hover));
            if(data.hasOwnProperty('custom'))
            {
                this.clear_custom();
                data.custom.forEach(d => {
                   this.add_custom(copy(d.style), copy(d.filter)); 
                });
            }
            //Resaving all
            if(save)
                this.emit(Output_Style_Events.CHANGE_STYLE_VIEW);
        }
    
        let custom =[];
        this._custom.forEach(filter => {
            custom.push({style: filter.style(), filter: filter.filter()});
        });
        
        return {
                    default: this.defaulte().style(),
                    hover: this.hover().style(),
                    custom: custom
                }
    }
    
    add_custom(style = null, filter = null)
    {
        let new_id = ++this._filter_id;
        let new_filter = this._make_custom_output_filter(new_id, 
                                                         style ? style : 
                                                         this._copy_last_style(), 
                                                         filter ? filter :
                                                        this._copy_last_filter());
        new_filter.on(Filter_Events.RENDER_DATA, () => this.emit(Filter_Events.RENDER_DATA))
                    .on(Output_Style_Events.CHANGE_STYLE_VIEW, () => this.emit(Output_Style_Events.CHANGE_STYLE_VIEW))
                    .on(Filter_Events.RENDER_FILTER, arg => this.emit(Output_Style_Events.CHANGE_STYLE_VIEW));
        this._custom.push(new_filter);
        this.emit(Output_Style_Events.ADD_CUSTOM, new_filter);
    }
    
    remove_custom(id)
    {
        let filter = null, index = -1;
        this._custom = this._custom.filter((f, idx) => {
            if(id == f.id())
            {
                index = idx;
                filter = f;
                f.remove();
                return false;
            }
            return true;
        });
        this.emit(Output_Style_Events.REMOVE_CUSTOM, id);
    }
    
    clear_custom()
    {
        this._custom.forEach(f => {
            f.remove();
            this.emit(Output_Style_Events.REMOVE_CUSTOM, f.id());
        });
        this._custom = [];
    }
    
    _make_custom_output_filter(id, style, filter)
    {
        return new Output_Filter(make_custom_filter_prefix(id), 
                                    '.' + make_custom_filter_prefix(id),
                                    style, 
                                    make_filter(
                                            this._view._render_custom_filter(id), 
                                            null, filter), 
                                    id);
    }
    
    _copy_last_style()
    {
        if(!this._custom.length) return this.defaulte().style();
        return this.custom(this._custom.length - 1).style();
    }
    
    _copy_last_filter()
    {
        if(!this._custom.length) return {};
        return this.custom(this._custom.length - 1).filter();
    }
}
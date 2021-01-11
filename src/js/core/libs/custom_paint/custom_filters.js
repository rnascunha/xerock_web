import {Style_Tag} from '../../../helper/style_config.js';
import {set_element_style} from '../../../helper/element_config.js';
import {set_selected, get_selected  } from '../../../helper/helpers_basic.js';
import {copy} from '../../../helper/object_op.js';
import {Event_Emitter} from '../../../libs/event_emitter.js';
import {expand_short_color} from '../../../helper/color.js';

export function make_line_str(name, prefix){
    return `<tr id=${prefix}-line>
        <td>${name}</td>
        <td><input class=${prefix}-bg-color type=color></td>
        <td><input class=${prefix}-text-color type=color></td>
        <td><input class=${prefix}-text-bold type=checkbox></td>
        <td><input class=${prefix}-text-italic type=checkbox></td>
        <td><input class=${prefix}-text-size type=number min=10 max=20 style=width:5ch></td>
        <td><select class=${prefix}-font-famity>
                <option value=monospace>monospace</option>
                <option value=sans-serif>sans-serif</option>
                <option value=serif>serif</option>
            </select></td>
        <td class=filter-${prefix}-example>Example output data</td>
    </tr>`
}

export class Custom_Filter extends Event_Emitter
{
    constructor(prefix, css_id, filter= {})
    {
        super();
        
        this._filter = filter;
        this._style = new Style_Tag(css_id, filter);
        
        this._prefix = prefix;
        
        this.append_head();
    }
    
    append_head()
    {
         document.getElementsByTagName('head')[0].appendChild(this._style.element());
    }
    
    remove()
    {
        this._style.element().parentNode.removeChild(this._style.element());
    }
    
    filter()
    {
        return copy(this._filter);
    }
    
    configure(base_element)
    {                        
        let bg = base_element.querySelector(`.${this._prefix}-bg-color`),
            color = base_element.querySelector(`.${this._prefix}-text-color`),
            bold = base_element.querySelector(`.${this._prefix}-text-bold`),
            italic = base_element.querySelector(`.${this._prefix}-text-italic`),
            size = base_element.querySelector(`.${this._prefix}-text-size`),
            font = base_element.querySelector(`.${this._prefix}-font-famity`),
            example = base_element.querySelector(`.filter-${this._prefix}-example`);            
        
        set_element_style(example, this._filter);
        
        bg.value = expand_short_color(this._filter.backgroundColor);
        bg.onchange = (ev) => {
            this._filter.backgroundColor = ev.target.value;
            this._style.update(this._filter);
            set_element_style(example, this._filter);
            this.emit('filter_change', {filter: this._filter, prop: 'backgroundColor'});
        }
        
        color.value = expand_short_color(this._filter.color);
        color.onchange = (ev) => {
            this._filter.color = ev.target.value;
            this._style.update(this._filter);
            set_element_style(example, this._filter);
            this.emit('filter_change', {filter: this._filter, prop: 'color'});
        }
        
        bold.checked = this._filter.fontWeight == 'bold' ? true : false;
        bold.onchange = ev => {
            this._filter.fontWeight = ev.target.checked ? 'bold' : 'normal';
            this._style.update(this._filter);
            set_element_style(example, this._filter);
            this.emit('filter_change', {filter: this._filter, prop: 'fontWeight'});
        }
        
        italic.checked = this._filter.fontStyle == 'italic' ? true : false;
        italic.onchange = ev => {
            this._filter.fontStyle = ev.target.checked ? 'italic' : 'normal';
            this._style.update(this._filter);
            set_element_style(example, this._filter);
            this.emit('filter_change', {filter: this._filter, prop: 'fontStyle'});
        }
        
        size.value = parseInt(this._filter.fontSize);
        size.onchange = ev => {
            this._filter.fontSize = '' + ev.target.value + 'px';
            this._style.update(this._filter);
            set_element_style(example, this._filter);
            this.emit('filter_change', {filter: this._filter, prop: 'fontSize'});
        }
        
        set_selected(font, this._filter.fontFamily);
        font.onchange = ev => {
            this._filter.fontFamily = get_selected(ev.target).value;
            this._style.update(this._filter);
            set_element_style(example, this._filter);
            this.emit('filter_change', {filter: this._filter, prop: 'fontFamily'});
        }
    }
}
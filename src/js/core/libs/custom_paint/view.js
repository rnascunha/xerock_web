import {Event_Emitter} from '../../../libs/event_emitter.js';
import {make_custom_filter_prefix} from './model.js';
import {Output_Style_Events, filter_config_section} from './types.js';
import {make_line_str} from './custom_filters.js';
import {html_to_element} from '../../../helper/helper.js';

export class Output_Style_View extends Event_Emitter
{
    constructor(model, container)
    {
        super();
        
        this._model = model;
        this._container = container;
                
        this._model.on(Output_Style_Events.CHANGE_STYLE, filter => this.change_style(filter))
                    .on(Output_Style_Events.ADD_CUSTOM, filter => this.add_custom(filter))
                    .on(Output_Style_Events.REMOVE_CUSTOM, filter => this.remove_custom(filter));
    }
    
    render()
    {
        this._container.innerHTML = filter_config_section;
        
        this._model.defaulte().configure(this._container.querySelector('#default-filter-table'));
        this._model.hover().configure(this._container.querySelector('#default-filter-table'));
        
        this._model._custom.forEach(f => {
            this.add_custom(f);
        });
        
        this._container.querySelector('#button-add-custom-filter').onclick = (ev) => {
            this.emit(Output_Style_Events.ADD_CUSTOM);
        }
    }
      
    change_style(filter)
    {     
        if(filter.type == 'default')
            this._model.defaulte().configure(this._container.querySelector('#default-filter-table'));
        
        if(filter.type == 'hover')
            this._model.hover().configure(this._container.querySelector('#default-filter-table'));
        
        this.emit(Output_Style_Events.CHANGE_STYLE_VIEW);
    }
    
    add_custom(filter)
    {
        filter.configure(this._container.querySelector('#custom-filter-table'));
                
        this.emit('render_data');
    }
    
    remove_custom(id)
    {
        let table = this._container.querySelector('#custom-filter-table'),
            prefix = make_custom_filter_prefix(id);

        let line = table.querySelector(`#${prefix}-line`);
        if(line) line.outerHTML = '';
        
        let filter_line = table.querySelector(`#${prefix}-line2`);
        if(filter_line) filter_line.outerHTML = '';
    }
    
    _render_custom_filter(id)
    {
        let table = this._container.querySelector('#custom-filter-table');
        let prefix = make_custom_filter_prefix(id);

        let line = html_to_element(
                    make_line_str('<a class=configure-delete-custom-filter>&times;</a>', prefix));
        line.querySelector('td').setAttribute('rowspan', 2);

        table.appendChild(line);

        let filter_container = html_to_element(`<tr id=${prefix}-line2><td colspan=7>><div></div></td></tr>`);
        table.appendChild(filter_container);

        //Removing filter
        line.querySelector('a').onclick = (ev) => {
            this.remove_custom(id);
            this.emit(Output_Style_Events.REMOVE_CUSTOM, id);
        }
        
        return filter_container.querySelector('div');
    }
}
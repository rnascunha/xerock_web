import {DATETIME_FORMAT, TIME_PRECISION} from '../../../time_format.js';
import {make_filter} from '../filter/functions.js';
import {Filter} from '../filter/controller.js';
import {make_select} from '../select/functions.js';
import {columns_default, columns_all} from '../select/types.js';
import {Output_Type} from '../../data/types.js';
import {get_radio_selected} from '../../../helper/helpers_basic.js';
import {format_all_data} from '../../data/format.js';
import {make_csv_data} from '../../../helper/csv.js';
import {make_html_table} from '../../../helper/html_table.js';
import {add_style_tag} from '../../../helper/element_config.js';
import {download} from '../../../helper/helper.js';

import {template, Output_File_Format, style_table} from './types.js';

export class Save_File
{
    constructor(data, element, options = {})
    {
        this._data = data;
        this._container = element;
        this._options = {
            ...{
                time_format: DATETIME_FORMAT.DATETIME.value,
                time_precision: TIME_PRECISION.MILISECONDS.value,
                data_format: Output_Type.NONE.value,
                select: columns_default,
                filter: {},
                stringify: true
            }, ...options};
        
        this.open();
    }
    
    _select(value, container)
    {
        switch(value)
        {
            case 'json':
                container.querySelector('#json-options').style.display = 'inline-block';
                container.querySelector('#csv-options').style.display = 'none';
                container.querySelector('#html-options').style.display = 'none';
                break;
            case 'csv':
                container.querySelector('#json-options').style.display = 'none';
                container.querySelector('#csv-options').style.display = 'inline-block';
                container.querySelector('#html-options').style.display = 'none';
                break;
            case 'html':
                container.querySelector('#json-options').style.display = 'none';
                container.querySelector('#csv-options').style.display = 'none';
                container.querySelector('#html-options').style.display = 'none';
                break;
        }
    }
    
    open()
    {        
        let div = document.createElement('div'),
            shadow = div.attachShadow({mode: 'open'});
        
        div.style.padding = '10px';
        
        shadow.appendChild(template.content.cloneNode(true));
        
        this._select('json', shadow);
        let file_format = shadow.querySelector('#file-format');
        file_format.onchange = ev => { this._select(ev.path[0].value, shadow) }
        
        const select = make_select(shadow.querySelector('#select'), this._options.select);
        const filter = make_filter(shadow.querySelector('#filter'), null, this._options.filter);
        
        let date_format = shadow.querySelector('#time-format'),
            date_format_value = date_format
                                .querySelector(`[value=${this._options.time_format}]`);
        if(date_format_value) date_format_value.selected = true;
        
        let time_precision = shadow.querySelector('#time-precision'),
            time_precision_value = time_precision
                                .querySelector(`[value=${this._options.time_precision}]`);
        if(time_precision_value) time_precision_value.selected = true;
        
        let output_format = shadow.querySelector('#data-format'),
            output_format_value = output_format
                                .querySelector(`[value=${this._options.data_format}]`);
        if(output_format_value) output_format_value.selected = true;
                
        shadow.querySelector('#ok-button').onclick = () => {
            this._options.time_format = date_format.selectedOptions[0].value || this._options.time_format;
            this._options.time_precision = time_precision.selectedOptions[0].value || this._options.time_precision;
            this._options.data_format = output_format.selectedOptions[0].value || this._options.data_format;            
            
            let file_format = get_radio_selected(shadow.querySelector('#file-format')).value;

            let file_name = shadow.querySelector('#file-name').value.trim();
            if(!file_name.length)
            {
                this.print_error(shadow, 'File name can\'t be empty');
                return;
            }
                                    
            //Add extension if doens't
            if(file_name.slice(-(file_format.length + 1)) !== ("." + file_format))
                file_name += '.' + file_format;
                        
            this._options.select = select.select();
            this._options.stringify = true;
            this._options.filter = filter.get();
            
            let file_data;
            switch(file_format)
            {
                case 'csv':
                    file_data = this.save_csv(this._format_data(), {sep: shadow.querySelector('#csv-sep').checked})
                break;
                case 'html':
                    file_data = this.save_html(this._format_data(), {});
                break;
                case 'json':
                    file_data = this.save_json({prettify: shadow.querySelector('#json-prettify').checked, 
                                                custom_paint: shadow.querySelector('#json-custom-paint').checked, 
                                                state: shadow.querySelector('#json-state').checked,
                                                select: shadow.querySelector('#json-select').checked
                                               });
                break;
            }
                        
            download(file_name, file_data);           
            
            this.close();
        }
        
        this._container.appendChild(div);
    }
    
    save_json(options)
    {
        let data = [];
        this._data.forEach(d => {
            if(Filter.filter(this._options.filter, d.data))
                data.push(d.data);
        });
        
        let json = {data: data};
        if(options.custom_paint) json.custom_paint = this._options.custom_paint;
        if(options.select) json.select = this._options.select;
        if(options.state) json.state = { time: {format: this._options.time_format, precision: this._options.time_precision },
                                        type: this._options.data_format};

        return JSON.stringify(json, null, options.prettify ? 2 : 0);
    }
    
    save_csv(data, options)
    {
        return make_csv_data(data, {header: this._options.select, add_sep: options.sep});
    }
    
    save_html(data, options)
    {
        let file_data = make_html_table(data, {header: this._options.select});
        return add_style_tag(file_data, style_table).outerHTML;
    }
    
    close()
    {
        this._container.dispatchEvent(new Event('close'));
    }
    
    print_error(container, error)
    {
        container.querySelector('#error').value = error;
    }
    
    _format_data()
    {
        let file_data = format_all_data(this._data, this._options);
                
        let formated_data = [];
        file_data.forEach(d => {
            let line = [];
            this._options.select.forEach(sel => line.push(d[sel]));
            formated_data.push(line);
        });
        
        return formated_data;
    }
}
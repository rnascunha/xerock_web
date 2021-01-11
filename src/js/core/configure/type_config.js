import {Event_Emitter} from '../../libs/event_emitter.js';
import {Byte_Array} from '../../libs/byte_array/byte_array.js';
import {Data_Type} from '../../libs/byte_array/types.js';

import {set_selected, get_selected} from '../../helper/helpers_basic.js';
import {DATETIME_FORMAT, TIME_PRECISION, Date_Time_Format} from '../../time_format.js';

import {Append_Input, default_profile_data, Configure_Events} from './types.js'

const type_config_section = `
<div class=types-config-section>
    <h3>Types</h3>
    <table>
        <tr><th colspan=5>Append input</th></tr>
        <tr id=configure-append-input></tr>
        <tr>
            <th>Text</th>
            <td colspan=5>
                <input type=checkbox id=espaced-string-check><label for=espaced-string-check>escaped strings</label>
            </td>
        </tr>
<!--        <tr>
            <th>#</th>
            <th>Padding</th>
            <th>Aggregate</th>
            <th>Separator</th>
            <th>Default</th>
        </tr>
        <tr>
            <th>Hexa</th>
            <td><input id=padding-hex type=checkbox></td>
            <td><input type=number style=width:4ch></td>
            <td><input style=width:2ch value=' '></td>
            <td><input type=radio name=default-bin-type></td>
        </tr>
        <tr>
            <th>Binary</th>
            <td><input id=padding-binary type=checkbox></td>
            <td><input type=number style=width:4ch></td>
            <td><input style=width:2ch value=' '></td>
            <td><input type=radio name=default-bin-type></td>
        </tr>   -->
    </table>
</div>
<div id=configure-app-time-opt class=types-config-section>
    <h3>Time</h3>
    <div class=configure-app-opt>
        <label style='display:block'>Datetime output format:<label>
        <select style='display:block' class=configure-app-opt-select id=configure-app-time-format size=${Object.keys(DATETIME_FORMAT).length}></select>
    </div>
    <div class=configure-app-opt>
        <label style='display:block'>Time precision:<label>
        <select style='display:block' class=configure-app-opt-select id=configure-app-time-precision  size=${Object.keys(TIME_PRECISION).length}></select>
    </div>
<div>`;

export class Type_Config extends Event_Emitter
{
    constructor()
    {
        super();
        
        this._time_format = default_profile_data().configure.types.time.format;
        this._time_precision = default_profile_data().configure.types.time.precision;
        this._append_input = default_profile_data().configure.types.append;
        this._type_opts = { escaped_string: default_profile_data().configure.types.escaped_string};
        
        this._container = null;
    }
    
    time(format = null, precision = null)
    {
        if(format)
            this._time_format = format;
        if(precision)
            this._time_precision = precision;
        if(format || precision) this.render_time_options();
        
        return {format: this._time_format, precision: this._time_precision};
    }
    
    get input_append()
    {
        return this._append_input;
    }
    
    get type_options()
    {
        return this._type_opts;
    }
    
    render(container)
    {
        this._container = container;
        this._container.innerHTML = type_config_section;
        
        this._render_time();
        this._render_types();
        
//        Promise.resolve().then(() => this.emit(Configure_Events.UPDATE_TYPES, this.state()));
    }
    
    state(state = null)
    {
        if(state !== null)
        {
            this.time(state.time.format, state.time.precision);
            this._type_opts = { escaped_string: state.escaped_string };
            this._append_input = state.append;
                        
            this.render_options();
            
            this.emit(Configure_Events.UPDATE_TYPES, this.state());
        }
        
        return {
            time: {
                precision: this._time_precision,
                format: this._time_format
            },
            escaped_string: this._type_opts.escaped_string,
            append: this._append_input
        }
    }
    
    _render_time()
    {
        let time_format_el = this._container.querySelector('#configure-app-time-format'),
            time_precision_el = this._container.querySelector('#configure-app-time-precision');
        Object.keys(DATETIME_FORMAT).forEach(key => {
            time_format_el.innerHTML += 
                    `<option value=${DATETIME_FORMAT[key].value}>${DATETIME_FORMAT[key].name}</option>`;
        });
        Object.keys(TIME_PRECISION).forEach(key => {
            time_precision_el.innerHTML += 
                    `<option value=${TIME_PRECISION[key].value}>${TIME_PRECISION[key].name}</option>`;
        });

        this.render_time_options();

        time_format_el.onchange = (ev) => {
            this._time_format = get_selected(time_format_el).value;
            this.emit(Configure_Events.UPDATE_TYPES, this.state());
        }

        time_precision_el.onchange = (ev) => {
            this._time_precision = get_selected(time_precision_el).value;
            this.emit(Configure_Events.UPDATE_TYPES, this.state());
        }        
    }
    
    _render_types()
    {
        let add_input_container = this._container.querySelector('#configure-append-input');
        Object.keys(Append_Input).forEach(k => {
            let td = document.createElement('td');
            
            let ai = Append_Input[k];
            td.title = ai.title ? ai.title : '';
            td.innerHTML += `<label><input type=radio name=append-input-char value=${k}>${ai.name}</label>`
            if(ai.default)
                td.querySelector('input').checked = true;
            
            add_input_container.appendChild(td);
        });
        let td = document.createElement('td');
        td.title = 'Custom';
        td.innerHTML += '<label><input type=radio name=append-input-char value=custom>Custom:<input id=append-input-custom-text style=width:5ch></label>';
        add_input_container.appendChild(td);
        
        let custom = td.querySelector('#append-input-custom-text');
        custom.addEventListener('focus', ev => {
            td.querySelector('input[type=radio]').checked = true;
        });
        
        custom.addEventListener('blur', ev => {
            let b = new Byte_Array();
            b.from(custom.value, Data_Type.text.value)
            this._append_input = b.raw();
            this.emit(Configure_Events.UPDATE_TYPES, this.state());
        });
        
        add_input_container.querySelectorAll('input[type=radio]').forEach(input => input.addEventListener('change', ev => {
            if(ev.target.value in Append_Input)
                this._append_input = Append_Input[ev.target.value].arr;
            else 
            {
                let b = new Byte_Array();
                b.from(custom.value, Data_Type.text.value)
                this._append_input = b.raw();
            };
            this.emit(Configure_Events.UPDATE_TYPES, this.state());
        }));
                
        //Escaped string check
        let escape_check = this._container.querySelector('#espaced-string-check');
        escape_check.checked = this._type_opts.escaped_string;
        escape_check.addEventListener('change', ev => {
            this._type_opts.escaped_string = ev.target.checked;
            this.emit(Configure_Events.UPDATE_TYPES, this.state());
        });
    }
    
    render_time_options()
    {
        let time_format_el = this._container.querySelector('#configure-app-time-format'),
            time_precision_el = this._container.querySelector('#configure-app-time-precision');
        
        set_selected(time_format_el, this._time_format);
        set_selected(time_precision_el, this._time_precision);
    }
    
    render_options()
    {
        let escape_check = this._container.querySelector('#espaced-string-check'),
            append_input = this._container.querySelector('#configure-append-input');
        
        escape_check.checked = this._type_opts.escaped_string;
        
        let arr_str = JSON.stringify(this._append_input);
        let res = Object.keys(Append_Input).some(key => {
            if(JSON.stringify(Append_Input[key].arr) == arr_str)
            {
                append_input.querySelector(`input[value="${key}"]`).checked = true;
                return true;
            }
            return false;
        });
        
        if(res) return;
        
        let ba = new Byte_Array();
        ba.raw(this._append_input);
        append_input.querySelector(`input[value=custom]`).checked = true;
        append_input.querySelector('#append-input-custom-text').value = ba.to(Data_Type.text.value);
    }
            
    time_format(time)
    {
        return Date_Time_Format.format(time, this._time_format, this._time_precision);
    }
}
import {Event_Emitter} from '../../libs/event_emitter.js';
import {Data_Events, Output_Type, table_config} from './types.js';
import {event_path} from '../../helper/compatibility.js';

import {format_data} from './format.js';
import {make_data_details} from './details.js';
import {Save_File} from '../libs/save_file/save_file.js';

import {columns} from '../libs/select/types.js';

import {DATETIME_FORMAT, TIME_PRECISION, Date_Time_Format} from '../../time_format.js';

import {Output_Style} from '../libs/custom_paint/model.js';
import {Output_Style_Events} from '../libs/custom_paint/types.js';

import {Filter_Events} from '../libs/filter/types.js';
import {Adaptative_Table} from '../libs/adaptative_table.js';

import {is_chrome} from '../../helper/compatibility.js';

const data_html = `
<div id=data-container>
    <div id=data-options>
        <div id=data-command>
            <button class=output-header-btn id=save-data-button>Save</button>
            <button class=output-header-btn id=clean-data-button>Clear</button>
            <button class=output-header-btn id=show-hide-filter-button>Filters</button>
            <label id=roll-auto-label><input type=checkbox id=roll-auto-box>Auto-roll</label>
            <select id=data-container-type></select>
            <button class=output-header-btn id=custom-paint-button></button>
            <select id=data-view-container></select>
        </div>
        <div id=filter-row-container></div>
        <div id=select-colunm-container></div>
    </div>
    <pre id=data-received></pre>
    <div id=data-received-container-go-bottom></div>
</div>`;

const template_context_menu = document.createElement('template');
template_context_menu.innerHTML = `
<li data-action=detail>Details</li>
<li data-action=delete>Delete</li>`;

export class Data_View extends Event_Emitter
{
    constructor(model, container, options = {})
    {
        super();
        
        this._model = model;
                
        this._container = container;
        this._container.innerHTML = data_html;
                
        this._data_container = this._container.querySelector('#data-received');
        this._table_container = null;
        
        this._data_container_type = this._container.querySelector('#data-container-type');
        this._data_container_type.addEventListener('change', () => {
            this.emit(Data_Events.CHANGE_STATE, this.state());
            this._data_options.data_format = this.type();
        });
        
        this._context_menu = options.context_menu;
            
        Object.values(Output_Type).forEach(d => {
            let op = document.createElement('option');
            op.value = d.value;
            op.textContent = d.name;
            if('default' in d && d.default === true)
                op.selected = true;
            
            this._data_container_type.appendChild(op);
        });
        
        this._data_options = {
            ...{
                time_format: DATETIME_FORMAT.TIME.value,
                time_precision: TIME_PRECISION.MILISECONDS.value,
                data_format: this.type(),
                select: null,
                stringify: false
            }, 
            ...options
        };
        
        this._auto_roll_check = this._container.querySelector('#roll-auto-box');
        this.auto_roll(true);
        this._auto_roll_check.addEventListener('click', () => {
            this.scroll_to_bottom(true);
            this.emit(Data_Events.CHANGE_STATE, this.state());
        });
        
        this._container
            .querySelector('#save-data-button')
                .addEventListener('click', () => this.open_save_menu());
        
        this._container.querySelector('#clean-data-button')
            .addEventListener('click', () => this.emit(Data_Events.CLEAR));
        
        this._set_filter_button();
        this._set_scroll();
        
        this._custom_paint = null;
        this._make_custom_paint();
                
        this._model.on(Data_Events.POST, arg => this.insert_data(arg))
            .on(Data_Events.PREPEND, arg => this.prepend_data(arg))
            .on(Data_Events.CLEAR, arg => this.clear(arg))
            .on(Data_Events.MAKE_OUTPUT, data => this.make_output(data))
            .on(Data_Events.SELECT, selected => this.select(selected))
            .on(Data_Events.FILTER, arg => this._set_line_filter_attr(arg.container, arg.filter))
            .on(Data_Events.DELETE, data => this.remove(data))
            .on(Data_Events.SERVER_NAME_CHANGE, data => this.update_server_name(data))
            .on(Data_Events.MESSAGE_SELECT, data => this.data_details(data));
        
        this._adapt_table = new Adaptative_Table(table_config);
    }
                
    init()
    {
        let view_container = this._container.querySelector('#data-view-container');
        this.emit(Data_Events.RENDER, {
            filter: this._container.querySelector('#filter-row-container'),
            select: this._container.querySelector('#select-colunm-container'),
            view: view_container
        });
        
        //View just working on chrome at the moment;
        if(!is_chrome) view_container.style.display = 'none';
        
        this._data_container.appendChild(this._make_template_table());
        
        //Setting data options
        this._data_options.select = this._model.select.columns();
    }
        
    get custom_paint(){ return this._custom_paint; }        
    open_save_menu()
    {
        let container = document.createElement('my-modal');
        container.id = 'modal-file-save';
        new Save_File(this._model.data, container, 
                           Object.assign({}, this._data_options, {
                                                                filter: this._model.filter.get() , 
                                                                select: this._model.select.select(),
                                                                custom_paint: this._custom_paint.config()
                                                            }));
        
        document.body.appendChild(container);
        container.show = true;
        
        container.addEventListener('close', ev => {
            container.show = false;
            container.parentElement.removeChild(container);
        });
    }

    _make_template_table()
    {
        this._adapt_table.init();
        
        let table = document.createElement('table');
        table.id = 'data-table';
        
        let thead = document.createElement('thead');
        thead.id = 'data-table-header';
        
        let hline = document.createElement('tr'),
            table_headers = {};
        this._model.select.columns().forEach(col => {
            let th = document.createElement('th'),
                selected = this._model.select.is_selected(col);

            th.classList.add('select-col');
            th.classList.add(col);
            th.setAttribute('data-selected', `${selected}`)
            th.dataset.column = col;

            th.title = columns[col].description;
            th.textContent = columns[col].name;
            
            table_headers[col] = th;
            
            thead.appendChild(th);
        });
        
        thead.addEventListener('click', ev => {
            let path = event_path(ev);
            if(path[0].dataset.column)
                this._model.select.remove(path[0].dataset.column);
        });
        
        this._adapt_table.update_headers(table_headers);
        this._adapt_table.set_all();
        
        table.appendChild(thead);
        
        this._table_container = document.createElement('tbody');
        this._table_container.id = 'data-table-body';
        
        this._table_container.addEventListener('click', this.select_line.bind(this));
        this._table_container.addEventListener('contextmenu', this.context_menu.bind(this));
        
        table.appendChild(this._table_container);
        
        return table;
    }
    
    _make_context_menu(line)
    {
        let lu = document.createElement('lu');
        lu.classList.add('context-menu-data');
        
        lu.appendChild(template_context_menu.content.cloneNode(true));
        lu.addEventListener('click', ev => {
            if(ev.target.dataset.action)
                switch(ev.target.dataset.action)
                {
                    case 'detail':
                        this.emit(Data_Events.MESSAGE_SELECT, line);
                    break;
                    case 'delete':
                       this.emit(Data_Events.DELETE, line);
                    break;
                }
        });
        
        return lu;
    }
    
    context_menu(ev)
    {
        ev.preventDefault();
        
        let line = null, target = ev.target;
        while(target !== this._table_container)
        {
            if(target.classList.contains('filter-line'))
            {
                line = target;
                break;
            }
            
            target = target.parentNode;
        }
        
        if(!line) return;
        
        this._context_menu.make(this._make_context_menu(line), ev, true);
        ev.stopPropagation();
    }
    
    select_line(ev)
    {
        ev.preventDefault();
        
        if(this._context_menu && this._context_menu.showing)
        {
            this._context_menu.hide();
            return;
        }
        
        let line = null, target = ev.target;
        while(target !== this._table_container)
        {
            if(target.classList.contains('filter-line'))
            {
                line = target;
                break;
            }
            
            target = target.parentNode;
        }
        
        if(!line) return;
        
        this.emit(Data_Events.MESSAGE_SELECT, line);
    }
    
    data_details(data)
    {
        let modal = document.createElement('my-modal');
        modal.id = 'modal-data-details';

        let container = make_data_details(data.data, Object.assign({}, this._data_options));
        modal.appendChild(container);
        
//        this._container.appendChild(modal);
        document.body.appendChild(modal);
        
        modal.addEventListener('close', ev => {
            modal.parentNode.removeChild(modal);
        });
        
        //This is needed so the container can get the keyboard events
        //https://stackoverflow.com/questions/10722589/how-to-bind-keyboard-events-to-div-elements
        container.tabIndex = -1;
        container.focus();
        
        container.addEventListener('keyup', ev => {
            switch(ev.code)
            {
                case 'ArrowLeft':
                    this.previous_details(data.container, modal);
                    break;
                case 'ArrowRight':
                    this.next_details(data.container, modal);
                    break;
                case 'Escape':
                    modal.show = false;
                    modal.parentNode.removeChild(modal);
                    break;
            }
        });
        
        container.addEventListener('click', ev => {
            switch(ev.path[0].dataset.value)
            {
                case 'delete':
                    this.emit(Data_Events.DELETE, data.container);
                    modal.show = false;
                    modal.parentNode.removeChild(modal);
                    break;
                case 'left':
                    this.previous_details(data.container, modal);
                    break;
                case 'right':
                    this.next_details(data.container, modal);
                    break;
            }
        });
        
        modal.show = true;
    }
    
    previous(container)
    {
        for(let i = container.previousElementSibling; 
            i !== null; 
            i = i.previousElementSibling) 
            if(i.dataset.filter == "true") return i;
        
        return null;
    }
    
    next(container)
    {
        for(let i = container.nextElementSibling; 
            i !== null; 
            i = i.nextElementSibling)
            if(i.dataset.filter == "true") return i;
        
        return null;    
    }
    
    previous_details(container, modal)
    {
        let n = this.previous(container);
        if(n)
        {            
            modal.show = false;
            modal.parentNode.removeChild(modal);
            this.emit(Data_Events.MESSAGE_SELECT, n);
        }
    }
    
    next_details(container, modal)
    {
        let n = this.next(container);
        if(n)
        {
            modal.show = false;
            modal.parentNode.removeChild(modal);
            this.emit(Data_Events.MESSAGE_SELECT, n);
        }
    }
        
    clear()
    {
        this._data_container.innerHTML = '';
        this._data_container.append(this._make_template_table());
    }
    
    remove(data)
    {
        if(data.container.parentNode)   //Why this need to be checked?
            data.container.parentNode.removeChild(data.container);
    }
    
    prepend_data(data)
    {   
        this._table_container
                    .prepend(data.container);
        
        this.scroll_to_bottom(true);
    }
        
    insert_data(data)
    {
        this._table_container
                    .appendChild(data.container);
        
        this.scroll_to_bottom(true);
    }
        
    type(tp = null)
    {
        if(tp !== null)
        {    
            this._data_container_type.querySelectorAll(`option`).forEach((op,idx) => {
                if(op.value === tp)
                {
                    this._data_container_type.selectedIndex = idx;
                    this._data_options.data_format = op.value;
                }
            });
        }
        
        return this._data_container_type.selectedOptions[0].value;
    }
    
    state(state = null)
    {
        if(state !== null)
        {
            this.auto_roll(state.auto_roll);
            this.type(state.type);
        }
        
        return {
            auto_roll: this.auto_roll(),
            type: this.type(),
        }
    }
    
    update_server_name(data)
    {
        let cell = data.container.querySelector('.sname');
        cell.textContent = data.data.sname;
        
        this._adapt_table.check('sname', cell);
    }
    
    update_time(time)
    {
        this._data_options.time_format = time.format;
        this._data_options.time_precision = time.precision;
        
        this._data_container.querySelectorAll('td.time').forEach((el, idx) => {
            el.textContent = Date_Time_Format.format(el.dataset.time, time.format, time.precision);
            if(idx === 0)
                this._adapt_table.check('time', el);
        });
    }
    
    _set_col_select_attr(td, attr)
    {
        if(this._model.select.is_selected(attr))
            this._show_column(td);
        else
            this._hide_column(td);
    }
    
    _set_line_filter_attr(tr, filter)
    {
        tr.setAttribute('data-filter', `${filter}`);
    }
    
    make_output(data)
    {
        data.container = this._make_table_line(data);
    }
    
    _make_table_line(data)
    {    
        let line = document.createElement('tr');
        line.classList.add('filter-line');
        this._set_line_filter_attr(line, data.filter);
        
        //The promise helps???
        Promise.resolve([data.data, line]).then(value => {
            this._custom_paint.filter_set(value[0], value[1]); 
        });
        
        let f_data = format_data(data.data, this._data_options);

        this._model.select.columns().forEach(attr => {
            
            let cell = document.createElement('td');
            cell.classList.add(attr, 'select-col');
            this._set_col_select_attr(cell, attr);
            
            if(attr !== 'payload')
                this._make_cell(cell, attr, f_data[attr], data.data[attr]);
            else
                cell.appendChild(this._make_payload(f_data[attr], f_data.payload_type));
            
            this._adapt_table.check(attr, cell);
            line.appendChild(cell);
        });

        return line;
    }
    
    _make_cell(cell, attr, value, data)
    {
        cell.textContent = value;
        if(attr == 'time')
        {
            cell.title = Date_Time_Format.format(data, DATETIME_FORMAT.DATETIME.value, TIME_PRECISION.MICROSECONDS.value);
            cell.dataset.time = data;            
        } else if(attr in table_config && attr !== 'id')
            cell.classList.add('flex-field');        
        
        return cell;
    }
            
    _make_payload(data, payload_type)
    {
        let line = document.createElement('div');
        line.classList.add('payload-container');
        if(payload_type)
            line.title = payload_type;
        
        if(!data) return line;
        if(!(data instanceof Array)) {
            line.textContent = data;
            return line;
        }
        
        data.forEach((d, idx) => {
            let cell = document.createElement('span');
            cell.classList.add('payload-item');
            
            if(idx === data.length - 1)
                cell.classList.add('payload-last-field');
            cell.textContent = d;
            line.appendChild(cell);
        });
        
        return line;
    }
    
    auto_roll(set = null)
    {
        if(set !== null)
        {
            this._auto_roll_check.checked = Boolean(set);
            this.scroll_to_bottom();
        }
        
        return this._auto_roll_check.checked;
    }
    
    scroll_to_bottom(check = false)
    {
        if(!check || this.auto_roll())
            this._data_container.scrollTop = this._data_container.scrollHeight;    
    }
    
    /**
    *   Select
    */
    select(selected)
    {
        this._model.select.columns().forEach(col => {
            let header = this._data_container.querySelector('#data-table-header').querySelector('.' + col),
                already = header.dataset.selected === 'true',
                to_select = selected.find(c => c === col) != null;
            if(already != to_select)
            {
                if(to_select){
                    this._show_column(header);
                    this._table_container.querySelectorAll(`.${col}`).forEach(el => this._show_column(el));
                } else {
                    this._hide_column(header);
                    this._table_container.querySelectorAll(`.${col}`).forEach(el => this._hide_column(el));
                }
                    
            }
        });
    }
    
    _show_column(el){ el.dataset.selected = true; }
    _hide_column(el){ el.dataset.selected = false; }
    
    /*
    * Initialize elements
    */
    _set_filter_button()
    {
        let filter_btn = this._container.querySelector('#show-hide-filter-button'),
            filters = this._container.querySelector('#filter-row-container'),
            columns = this._container.querySelector('#select-colunm-container');
        filter_btn.onclick = ev => {
            
            if(filters.style.display === 'none')
            {
                filter_btn.classList.remove('not-pressed-btn');
                filter_btn.classList.add('pressed-btn');
                filters.style.display = 'block';
                columns.style.display = 'block';
            } else {
                filter_btn.classList.remove('pressed-btn');
                filter_btn.classList.add('not-pressed-btn');
                filters.style.display = 'none';
                columns.style.display = 'none';
            }
        }
        filter_btn.dispatchEvent(new Event('click'));
    }
    
    add_custom_paint(css, filter)
    {
        console.assert(typeof css === 'object' && typeof filter === 'object', 'Arguments must be "object"');
        this._custom_paint.add_custom(css, filter);        
    }
    
    set_data_custom_paint()
    {
        return new Promise(() => this._model.data.forEach(d => {
            this._custom_paint.filter_set(d.data, d.container);
        }));
    }
    
    config_custom_paint(data = null, save = true)
    {
        if(data !== null)
        {
            let d = this._custom_paint.config(data, save);
            this.set_data_custom_paint();
            return d;
        }
        
        return this._custom_paint.config();
    }
    
    _make_custom_paint()
    {
        let paint_modal = document.createElement('my-modal');
        paint_modal.id = 'modal-custom-paint';
        document.body.appendChild(paint_modal);
        
        this._custom_paint = new Output_Style(paint_modal);
        this._container.querySelector('#custom-paint-button').addEventListener('click', ev => {
            paint_modal.show = true;
        });
                
        this._custom_paint
            .on(Filter_Events.RENDER_DATA, () => {
                                this.set_data_custom_paint();
                                this.emit(Data_Events.CUSTOM_PAINT, this._custom_paint.config());
            })
            .on(Output_Style_Events.CHANGE_STYLE_VIEW, () => {
                                this.set_data_custom_paint();
                                this.emit(Data_Events.CUSTOM_PAINT, this._custom_paint.config());
            })
            .on(Output_Style_Events.ADD_CUSTOM, () => 
                                this.emit(Data_Events.CUSTOM_PAINT, this._custom_paint.config())
            )
            .on(Output_Style_Events.REMOVE_CUSTOM, () =>
                                this.emit(Data_Events.CUSTOM_PAINT, this._custom_paint.config()));

        this._custom_paint.render();
    }
    
    _set_scroll()
    {
        let scroll_button = this._container.querySelector('#data-received-container-go-bottom');
        scroll_button.style.display = 'none';
        scroll_button.onclick = ev => this.scroll_to_bottom();
        
        //Show (or not) the button scroll if data window is at the bottom (or not)
        let timeout_handler = null;
        this._data_container.addEventListener('scroll', ev => {
            if((this._data_container.scrollHeight - 
               this._data_container.scrollTop) === this._data_container.clientHeight)
            {
                clearTimeout(timeout_handler);
                timeout_handler = setTimeout(() => { scroll_button.style.display = 'none'}, 100);
            }
            else
            {
                clearTimeout(timeout_handler);
                timeout_handler = setTimeout(() => { scroll_button.style.display = 'block'}, 100);
            }
        });
    }
}
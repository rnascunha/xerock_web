import {Fake_Core} from './fakes/fakes.js';
import {make_data} from '../../js/core/data/functions.js';
import {Context_Menu} from '../../js/libs/context_menu.js';
import {columns_all, columns} from '../../js/core/libs/select/types.js';
import {DATETIME_FORMAT, TIME_PRECISION} from '../../js/time_format.js';
import {Terminal_View} from '../../js/modules/view/terminal.js';

let config = {
    time: {
        format: DATETIME_FORMAT.TIME.value,
        precision: TIME_PRECISION.MILISECONDS.value
    }
}

columns_all.unshift('file');
columns.file = {value: 'file', name: 'file', description: 'File Name', default: false}

let core = new Fake_Core(make_data(document.querySelector('#data'), {context_menu: new Context_Menu()}));
core.register_view('Terminal', Terminal_View);

const set_time = (time) => {
    config.time = time;
    core.data.update_time(time);
}

const load_options = document.querySelector('#load-options');
load_options.label = 'Options';
load_options.add_checkbox('data', 'Data', true);
load_options.add_checkbox('custom_paint', 'Custom Paint', true);
load_options.add_checkbox('state', 'State', true);
load_options.add_checkbox('select', 'Select', true);

function load_data(event) 
{
    let files = event.target.files,
        len = files.length;
    for(let i = 0; i < len; i++)
        files[i].text().then(result => {
            try{
                result = JSON.parse(result);

                if('select' in result && load_options.value('select').checked)
                    core.data.select.select(result.select);

                if('state' in result && load_options.value('state').checked)
                {   
                    core.data.view_state(result.state);
                    set_time(result.state.time); 
                }

                console.log('custom paint', result.custom_paint);
                if('custom_paint' in result && load_options.value('custom_paint').checked)
                    core.data.config_custom_paint(result.custom_paint, false);

                if('data' in result && load_options.value('data').checked)
                {    result.data.forEach(d => {
                        d.file = files[i].name;
                        core.data.post(d);
                        core.message(d);
                    });
                    core.emit_ids();
                }                    

                //If uncomment, allow same file to be load multiple times...
                //Should? For diferent configs...
                //event.target.value = '';
            }
            catch(e)
            {
                console.error(e);
            }
        });
}

document.querySelector('#file-input').addEventListener('change', ev => load_data(ev));
document.querySelector('#configure').addEventListener('click', ev => {
    let modal = document.createElement('my-modal');

    modal.innerHTML = `
<div id=configure-container>
<h3>Configure</h3>
<div style=display:flex>
<div class=option>
    <span class=title>Datetime format:</span></br>
    <select id=datetime-format class=select-config></select>
</div>
<div class=option>
    <span class=title>Time precision:</span></br>
    <select id=time-precision class=select-config></select>
</div>
</div>
</div>`;

    let date_format = modal.querySelector('#datetime-format');
    date_format.size = Object.keys(DATETIME_FORMAT).length;
    Object.values(DATETIME_FORMAT).forEach(date => {
        let op = document.createElement('option');
        op.value = date.value;
        op.textContent = date.name;
        if(date.value === config.time.format) op.selected = true;
        date_format.appendChild(op);
    });

    let time_precision = modal.querySelector('#time-precision');
    time_precision.size = Object.keys(TIME_PRECISION).length;
    Object.values(TIME_PRECISION).forEach(precision => {
        let op = document.createElement('option');
        op.value = precision.value;
        op.textContent = precision.name;
        if(precision.value === config.time.precision) op.selected = true;
        time_precision.appendChild(op);
    });

    time_precision.addEventListener('change', ev => {
        core.data.update_time({format: date_format.selectedOptions[0].value,
                         precision: time_precision.selectedOptions[0].value});                            
    });

    date_format.addEventListener('change', ev => {
        core.data.update_time({format: date_format.selectedOptions[0].value,
                         precision: time_precision.selectedOptions[0].value});                            
    });

    modal.id = 'modal-container';

    document.body.appendChild(modal);
    modal.show = true;

    modal.addEventListener('close', ev => {
        modal.parentNode.removeChild(modal);
    });
});
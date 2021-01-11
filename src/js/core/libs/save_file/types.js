import {DATETIME_FORMAT, TIME_PRECISION} from '../../../time_format.js';
import {make_radio_buttons} from '../../../helper/make_elements.js';
import {Output_Type} from '../../data/types.js';

export const Output_File_Format = {
    json: 'JSON',
    csv: 'CSV',
    html: 'HTML'
}

const default_filename = 'output_data';

export const style_table = `
table{
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
    border-collapse: collapse;
}

thead th{
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #4CAF50;
      color: white;
}

td, th{
    padding: 5px 10px;
}

tbody tr{
    cursor: pointer
}

tbody tr:nth-child(odd){
    background-color: #f2f2f2;
}

tbody tr:hover{
    background-color: #ddd;
}
`;

const html = `
<style>
    .category
    {
        display: flex;
        margin-bottom: 10px;
    }

    .category-line
    {
        margin-bottom: 10px;
    }

    .option
    {
        margin-right: 10px;
    }

    .title
    {   
        font-weight: bold; 
    }

    .select-config
    {
        overflow: hidden;
        padding: 3px;
    }

    #file-format-container
    {
        border: 1px solid black;
        padding: 4px;
    }

    #commands
    {
        margin-right: 10px;
    }

    #commands > *
    {
        padding: 10px;
    }

    #error{ padding: 0px; }
</style>
<h3>Save to File</h3>
<div class=category>
    <div class=option id=file-format-container>
        <label for=file-format class=title>File format</label><br>
        <div id=file-format></div>
    </div>
    <div class=option>
        <div id=json-options>
            <label class=title>JSON</label><br>
            <label><input type=checkbox id=json-prettify>Prettify</label>
            <label><input type=checkbox id=json-custom-paint checked>Custom paint</label>
            <label><input type=checkbox id=json-state checked>State</label>
            <label><input type=checkbox id=json-select checked>Select</label>
        </div>
        <div id=csv-options>
            <label class=title>CSV</label></br>
            <label><input type=checkbox id=csv-sep checked>Add "sep" field</label>
        </div>
        <div id=html-options>
        </div>
    </div>
</div>
<div class=category>
    <div class=option>
        <label class=title>Datetime format:</label><br>
        <select id=time-format class=select-config></select>
    </div>
    <div class=option>
        <label class=title>Time precision:</label><br>
        <select id=time-precision class=select-config></select>
    </div>
    <div class=option>
        <label for=data-format class=title>Payload format:</label></br>
        <select id=data-format class=select-config></select>
    </div>
</div>
<div class=category-line>
    <span class=title>Select:</span><br>
    <div id=select></div>
</div>
<div class=category-line>
    <span class=title>Filter:</span><br>
    <div id=filter></div>
</div>
<hr>
<div id=commands>
        <label>File name:</label>
        <input id=file-name value=${default_filename}>
        <button id=ok-button value=save>Download</button>
        <closeable-status id=error behaviour=hidden></closeable-status>
</div>
`;

export const template = document.createElement('template');
template.innerHTML = html;

(function()
 {
    template.content
        .querySelector('#file-format')
        .appendChild(make_radio_buttons('save-file', Output_File_Format, 0)); 

    let date_format = template.content.querySelector('#time-format');
    date_format.size = Object.keys(DATETIME_FORMAT).length;
    Object.values(DATETIME_FORMAT).forEach(date => {
        let op = document.createElement('option');
        op.value = date.value;
        op.textContent = date.name;
        date_format.appendChild(op);
    });

    let time_precision = template.content.querySelector('#time-precision');
    time_precision.size = Object.keys(TIME_PRECISION).length;
    Object.values(TIME_PRECISION).forEach(precision => {
        let op = document.createElement('option');
        op.value = precision.value;
        op.textContent = precision.name;
        time_precision.appendChild(op);
    });

    let output_format = template.content.querySelector('#data-format');
    output_format.size = Object.keys(Output_Type).length;
    Object.values(Output_Type).forEach(format => {
        let op = document.createElement('option');
        op.value = format.value;
        op.textContent = format.name;
        output_format.appendChild(op);
    });
})()

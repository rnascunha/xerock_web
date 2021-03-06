import {copy_clipboard} from '../../js/helper/util.js';
import {Byte_Array} from '../../js/libs/byte_array/byte_array.js';
import {Data_Type} from '../../js/libs/byte_array/types.js';

let data_el = document.querySelector('#data-input'),
    data_select = document.querySelector('#data-input-select'),
    padding_el = document.querySelector('#padding'),
    table_el = document.querySelector('#data-table'),
    length_el = document.querySelector('#length'),
    raw_el = document.querySelector('#data-output-raw'),
    error_el = document.querySelector('#error'),
    hide_el = document.querySelector('#hide-check');

function error(message = '', arg = false)
{
    error_el.textContent = message + (arg ? ' / arg=[' + arg + ']' : '');
    error_el.style.display = message ? 'block' : 'none';
}

error();

let convert_arr = [];
/**
 * Making table
 */
Object.keys(Data_Type).forEach(type => {
    let line = document.createElement('tr'),
        head = document.createElement('th'),
        cell = document.createElement('td');    
        cell.setAttribute('id', 'data-output-' + Data_Type[type].value);
        head.textContent = Data_Type[type].name;
        head.title = `${Data_Type[type].long_name} (click to copy)`;
        head.addEventListener('click', ev => {
            copy_clipboard(cell.textContent);
        });

        line.appendChild(head);
        line.appendChild(cell);
        table_el.appendChild(line);

        convert_arr.push([cell, Data_Type[type].value]);

    let op = document.createElement('option');
        op.textContent = Data_Type[type].name;
        op.value = Data_Type[type].value;
        data_select.appendChild(op);
});

let data = new Byte_Array();

const convert_func = ev => {
    if(!data_el.value === null) return;

    if(ev)
        switch(ev.key)
        {
            case 'Escape':
                data_el.value = '';
                break;
        }

    if(!data_select.value)
    {
        console.error('No data selected');
        return;
    }

    try{
        let conversion = data.from(data_el.value, data_select.value, {padding: padding_el.checked});
        error();

        raw_el.textContent = data.raw_str();
        raw_el.classList.remove('error');
        length_el.value = data.size();
        convert_arr.forEach(el => {
            try{
                el[0].textContent = data.to(el[1], {padding: padding_el.checked});
                el[0].classList.remove('error');
            } catch(e){
                el[0].textContent = e.message + (e.arg ? ' / arg=[' + e.arg + ']' : '');
                el[0].classList.add('error');
            }
        });
    }catch(e){
        raw_el.classList.add('error');
        length_el.textContent = 'null';
        error(e.message, e.arg);
        raw_el.textContent = 'Fail conversion';
        convert_arr.forEach(el => {
            el[0].textContent = 'Fail conversion';
            el[0].classList.add('error');
        });
        return;
    }
}

/**
 * Get link
 */
document.querySelector('#get-link').addEventListener('click', ev => {
    let data;
    try{
        data = Byte_Array.parse(data_el.value, data_select.value);
    } 
    catch(e)
    {
        data = [];
    }
        
    const link = window.location.origin + 
            window.location.pathname + 
            `?type=${data_select.value}` + 
            `&padding=${padding_el.checked}` +
            `&hide=${hide_el.checked}` +
            `&data=${JSON.stringify(data)}`;
    
    copy_clipboard(link);
});

data_el.addEventListener('keyup', convert_func);
data_el.addEventListener('paste', convert_func);
data_select.addEventListener('change', convert_func);
padding_el.addEventListener('change', convert_func);

function hide_container(val = null)
{
    const c = document.querySelector('#convert-data');
    if(val != null)
    {
        hide_el.checked = Boolean(val);
    }
    c.style.display = hide_el.checked ? 
                        'none' : 
                        'inline-block';
}

hide_el.addEventListener('change', ev => hide_container());

/**
 * Parsing link data;
 */
let query = window.location.search.slice(1).split('&');
query.forEach(q => {
    let u = q.split('=');
    if(u.length != 2) return;
    
    switch(u[0])
    {
        case 'data':
            try{
                let d = JSON.parse(u[1]);
                d = Byte_Array.raw(d);
                data_el.value = Byte_Array.to(d, data_select.value);
            } catch(e){}
            break;
        case 'type':
            if(u[1] in Data_Type)
            {
                data_select.value = u[1];
            }
            break;
        case 'padding':
            if(u[1] == 'false') padding_el.checked = false;
            break;
        case 'hide':
            if(u[1] == 'true') hide_container(true);
            break;
    }
});
/**
 * Converting 
 */
convert_func();

/**
 * Custom protocol
 */
const cp = document.querySelector('#custom-protocol');
/*
 * Add one field to custom protocol
 */
cp.add();
data_el.focus();

cp.addEventListener('calculate', ev => {
    let data_items = ev.detail;
    if(data_items.status)
    {
        data.raw(data_items.data);
        raw_el.innerHTML = '';
        raw_el.appendChild(formated_output(data_items.items, Data_Type.uint8.value));
        [Data_Type.text, Data_Type.hex, Data_Type.binary, Data_Type.int8, Data_Type.uint8].forEach((type, idx) => {
            convert_arr[idx][0].innerHTML = '';
            convert_arr[idx][0].appendChild(formated_output(data_items.items, type.value));    
            convert_arr[idx][0].classList.remove('error');
        });

        let values = Object.values(Data_Type),
            len = values.length;
        for(let i = 5; i < len; i++){
            convert_arr[i][0].textContent = data.to(values[i].value);
            convert_arr[i][0].classList.remove('error');
        }

//                data.raw(data_items.data);
//                raw_el.innerHTML = '';
//                raw_el.appendChild(formated_output2(data_items, Data_Type.UINT8.value));
//                Object.values(Data_Type).forEach((d, idx) => {
////                   formated_output2(data_items, d.value); 
////                    if(d.value === 'string') return;
//                    convert_arr[idx][0].innerHTML = '';
//                    convert_arr[idx][0].appendChild(formated_output2(data_items, d.value));
//                });
    }
});

function formated_output2(data, type)
{
    let byte_array = new Byte_Array(),
        num_bytes = Byte_Array.num_bytes(type),
        span = document.createElement('span');

    byte_array.raw(data.data);
    let ob_arr = byte_array.to_arr(type);

    function sum(comp)
    {
        return Object.values(comp).reduce((acc, curr) => acc + curr, 0);
    }

    let temp = {}, comp = {0: {}}, index = 0;
    data.items.forEach((item, idx) => {
        item.data.forEach(d => {
            let s = sum(comp[index]);
            if(s == num_bytes) {index++; comp[index] = {}; }
            if(idx in comp[index]) comp[index][idx]++;
            else comp[index][idx] = 1;
        });
    });

    Object.values(comp).forEach((v, idx) => {
        let arr = Object.keys(v);
        if(arr.length == 1)
            span.innerHTML += `<span style="background-color:${data.items[arr[0]].bg};"> ${ob_arr[idx]}</span>`;
        else {
            let bg = arr.reduce((acc,c, idx) => {
                let total = acc + data.items[arr[idx]].bg;
                if(idx === arr.length - 1)
                    return total;
                return total + ','                        
            }, '');
            let style = `"background-image: linear-gradient(to right, ${bg});"`;
            span.innerHTML += `<span style=${style}> ${ob_arr[idx]}</span>`;
        }
    });
    return span;
}

function formated_output(items, type)
{            
    let span = document.createElement('span'),
        byte_array = new Byte_Array();

    items.forEach((item, idx) => {
        if(idx)
            span.innerHTML += `<span style="background-image: linear-gradient(to right, ${items[idx-1].bg}, ${item.bg});"> </span>`;       

        let s = document.createElement('span');
        s.style.backgroundColor = item.bg;
        byte_array.raw(item.data);
        s.textContent = byte_array.to(type);

        span.appendChild(s);
    });

    return span;
}
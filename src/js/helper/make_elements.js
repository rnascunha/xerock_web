export function make_element(tag, attrs, content = null){
    let el = document.createElement(tag);
    set_element_attr(el, attrs);
    if(content) el.textContent = content;

    return el;
}

export function make_button(obj){
    return make_element('button', obj.attrs, obj.value);
}

export function make_select(obj){
    let select = make_element('select', obj.attrs);
    Object.keys(obj.options).forEach((opt, idx) => {
        let op = make_element('option', obj.option_attrs ? obj.option_attrs : {}, obj.options[opt]);
        if(obj.hasOwnProperty('selected') && 
            (typeof obj.selected == 'number' && obj.selected == idx) ||
            (typeof obj.selected == 'string' && obj.selected == opt)) op.selected = true;
        select.appendChild(op);
    });
    return select;
}

export function make_input(obj){
    obj.attrs.type = obj.type;

    if(obj.hasOwnProperty('value')) obj.attrs.value = obj.value;
    if(obj.hasOwnProperty('checked') && obj.checked) obj.attrs.checked = true;
    if(obj.hasOwnProperty('name')) obj.attrs.name = obj.name;

    return make_element('input', obj.attrs);
}

export function make_label(obj){
    if(obj.hasOwnProperty('for')) obj.attrs.for = obj.for;
    return make_element('label', obj.attrs, obj.value);
}

export function make_form(form){
    let nodes = [];
    form.forEach(obj => {
        if(!obj.hasOwnProperty('attrs')) obj.attrs={};
        switch(obj.type){
            case 'label':
                nodes.push(make_label(obj));
                break;
            case 'button':
                nodes.push(make_button(obj));
                break;
            case 'select':
                nodes.push(make_select(obj));
                break;
            default:
                nodes.push(make_input(obj));
                break;
        } 
    });
    return nodes;
}

export function make_radio_buttons(name, obj, checked = 0){
    console.assert(typeof obj === 'object', 'Parameter must be a object');
    
    let form = document.createElement('form');
    Object.keys(obj).forEach((op, idx) => {
        let option = document.createElement('input');
        option.setAttribute('name', name);
        option.setAttribute('type', 'radio');
        option.setAttribute('value', op);
        if(idx == checked) option.setAttribute('checked', true);
        form.appendChild(option);
        
        let label = document.createElement('label');
        label.appendChild(option)
        label.appendChild(document.createTextNode(obj[op]));
        form.appendChild(label);
    });
    
    return form;
}
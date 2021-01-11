export function set_element_style(element, styles){
    if(!styles) return element;
    
    //https://stackoverflow.com/a/34490573
    Object.assign(element.style, styles);
    
    return element;
}

export function css_text(styles){
    let template = document.createElement('template');
    set_element_style(template, styles);
    
    return template.style.cssText;
}

export function make_style_element(name, styles){
    let style = document.createElement('style');
    style.textContent = `${name}{${css_text(styles)}}`;
    
    return style;
}

export function update_style_element(element, name, styles){
    element.textContent = `${name}{${css_text(styles)}}`;
}

export function add_style_tag(element, style){
    let el = document.createElement('style');
    el.textContent = style;
    
    let div = document.createElement('div');
    div.appendChild(el);
    div.appendChild(element);
    
    return div;
}

export function set_element_attr(element, attrs){
    if(!attrs) return element;
    Object.keys(attrs).forEach(attr => {
        switch(attr){
            case 'style':
                set_element_style(element, attrs[attr]);
                break;
            default:
                if(attrs[attr] instanceof Array)
                    element.setAttribute(attr, attrs[attr].join(' '));
                else
                    element.setAttribute(attr, attrs[attr]);
                break;
        }
    });
    return element;
}

export function scroll_to_bottom(element){
    element.scrollTop = element.scrollHeight;
}


//const table_test = {
//    table: {
//        thead: {
//            tr: {
//                td: ['a', 'b', 'c', 'd']
//            }
//        },
//        tbody: {
//            tr: [{td: [1,2,3,4]}, {td: [5,6,7,8]}, {td: [9,10,11,12]}],
//        }
//    }
//}
//
//function create_element_tree(json_tree, element = null){
//    let n_el = element;
//    
//    Object.keys(json_tree).forEach(el => {
//        console.log('root', json_tree);
//        if(typeof json_tree[el] === 'object'){
//            console.log('is object', json_tree[el]);
//            let nn_el = document.createElement(el);
//            n_el.appendChild(create_element_tree(json_tree[el], nn_el));
//            return n_el;
//        }else if(json_tree[el] instanceof Array){
//            console.log('is array', json_tree[el]);
//            json_tree[el].forEach(a_el => {
//                create_element_tree(a_el, n_el);
//            });
//        } else {
//            console.log('is data', json_tree[el]);
//            n_el.textContent = el;
//        }
//    });
//    
//    return n_el;
//}
//
//console.log(create_element_tree(table_test));

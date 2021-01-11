export function stringfy_array(arr, sep = ' '){
    console.assert(arr instanceof Array, "Parameter must be a Array");
    
    let data = "";
    arr.forEach(a => {
        data += a + sep;
    });
    
    return data.slice(0, -sep.length);
}

export function add_zero(value, num){
    let z = "";
    for(let i = 0; i < num; i++) z += '0';
    
    return (z + value).slice(-num);
}

//https://stackoverflow.com/questions/49804693/javascript-copying-randomly-generated-text-value-to-the-clipboard
export function copy_clipboard(data){
    let input = document.createElement("input");

    input.style.opacity="0";
    input.style["pointer-events"] = "none";
    document.body.appendChild(input);
    input.value = data;
    input.focus();
    input.select();
    document.execCommand('copy');

    document.body.removeChild(input);
}

export const curry = (fn, ...curryArgs) => (...args) => fn(...args, ...curryArgs);
export const curry_pre = (fn, ...curryArgs) => (...args) => fn(...curryArgs, ...args);
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function validade_ipv4_addr(addr){
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(addr);
}

export function validade_port(port){
    if(!/^[0-9]+$/.test(port)){
        return false;
    }
    
    let port_int = parseInt(port);
    
    return !(Number.isNaN(port_int) || port_int <= 0 || port_int > 65535); 
}

export function str2ab(str) {
    let buf = new ArrayBuffer(str.length); // 1 bytes for each char
    let bufView = new Uint8Array(buf);
    for(let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    
    return buf;
}

export function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

export function convert_binary(data){
    let view1 = new DataView(data); 
    let data_p = "";
    for(let i = 0; i < view1.byteLength; i++){
        data_p += ('0' + view1.getUint8(i).toString(16)).substr(-2, 2) + " ";
    }
    
    return data_p;
}

export function array_int_to_string(data){
    let data_p = "";
    data.forEach(d => {
       data_p += ('0' + d.toString(16)).substr(-2, 2) + " ";
    });
    
    return data_p;
}

export function is_printable_char(key){
    return key.length === 1;
}

export function is_int_at_printable_range(i){
    if(i >= 32 && i < 126) return true;
}

export function is_binary_char(key){
    return key === '1' || key ==='0';
}

export function is_hex_char(key){
    return (key >= '0' && key <= '9') 
            || (key >='a' && key <= 'f')
            || (key >= 'A' && key <= 'F');
}

export function hex_str_to_array(str){
    if(str.length == 0) return str;
    if((str.length % 2) != 0){
        let char = str.charAt(str.length - 1);
        str = str.substr(0, str.length - 1) + '0';
        str += char;  
    } 
    
    return new Uint8Array(str.match(/[\da-fA-F]{2}/gi)
                    .map(function (h) { return parseInt(h, 16)})
            );
}

export function binary_str_to_array(str){
    return new Uint8Array(str.match(/[01]{1,8}/gi)
                    .map(function(h) { return parseInt(h, 2)})
            );
}

export function get_selected(el){
    let opt;
    for (let i = 0, len = el.options.length; i < len; i++ ) {
        opt = el.options[i];
        if (opt.selected === true ){
            break;
        }
        opt = false;
    }
    return opt;
}

export function set_selected(el, value){
    let opt;
    for (let i = 0, len = el.options.length; i < len; i++ ) {
        opt = el.options[i];
        opt.selected = false;
        if (opt.value === value){
            opt.selected = true;
        }
    }
    return opt;
}

export function get_radio_selected(el){
    let op = false;
    let inputs = el.querySelectorAll('input[type=radio]');
    for (var i of inputs) {
        if(i.checked === true){
            op = i;
            break;
        }
    }
    return op;
}

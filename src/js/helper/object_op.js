export function copy(obj){
    if(obj instanceof Array) return Object.assign([], obj);
    if(typeof obj == 'object') return Object.assign({}, obj);
    return false;
}

export function is_empty(obj){
    if(obj instanceof Array) return obj.length == 0 ? true : false;
    return Object.keys(obj).length === 0 && obj.constructor === Object
}

export const Events = {
    ERROR: Symbol('error'),
    OPEN: Symbol('open'),
    CLOSE: Symbol('close'),
    ADD: Symbol('add'),
}

export const ws_protocol = {
    plain: {value: 'ws', name: 'ws'},
    secure: {value: 'wss', name: 'wss'},
}

export const default_addr = '127.0.0.1';
export const default_port = 80;
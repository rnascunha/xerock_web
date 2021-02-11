export const UDP_Client_Secure = {
    plain: {value: 'plain', name: 'Plain', selected: true}
}
Object.freeze(UDP_Client_Secure);

export const UDP_Client_Addr = '127.0.0.1';
export const UDP_Client_Port = {
    value: 8089,
    min: 1025,
    max: 65535    
}
Object.freeze(UDP_Client_Port);

export const UDP_Client_Error = {
    NOT_FOUND: {code: 11, message: 'Client not found'},
    NOT_SELECTED: {code: 11, message: 'No clients selected'},
    INVALID_ADDR: {code: 20, message: 'Invalid addr'},
    INVALID_PORT: {code: 21, message: 'Invalid port'},
}
Object.freeze(UDP_Client_Error);

export const UDP_Client_Events = {
    OPEN: Symbol('open socket'),
    CLOSE: Symbol('close socket'),
    STATUS: Symbol('status socket'),
    ERROR: Symbol('error'),
    SERVER_ERROR: Symbol('server error'),
    UPDATE: Symbol('update server'),
};
Object.freeze(UDP_Client_Events);

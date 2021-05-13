export const UDP_Server_Secure = {
    plain: {value: 'plain', name: 'Plain', selected: true},
}
Object.freeze(UDP_Server_Secure);

export const UDP_Server_Addr = '0.0.0.0';
export const UDP_Server_Port = {
    value: 8089,
    min: 1025,
    max: 65536    
}
Object.freeze(UDP_Server_Port);

export const UDP_Server_Error = {
    SERVER_NOT_FOUND: {code: 11, message: 'Server not found'},
    CLIENT_NOT_SELECTED: {code: 11, message: 'No clients selected'},
    INVALID_ADDR: {code: 20, message: 'Invalid addr'},
    INVALID_PORT: {code: 21, message: 'Invalid port'},
    INVALID_SECURE: {code: 22, message: 'Invalid secure type'}
}
Object.freeze(UDP_Server_Error);

export const UDP_Server_Events = {
    OPEN: Symbol('open socket'),
    CLOSE: Symbol('close socket'),
    STATUS: Symbol('status socket'),
    ADD_CLIENT: Symbol('add client'),
    CLOSE_CLIENT: Symbol('close client'),
    ERROR: Symbol('error'),
    SERVER_ERROR: Symbol('server error'),
    UPDATE: Symbol('update server'),
};
Object.freeze(UDP_Server_Events);

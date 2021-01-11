export const TCP_Server_Secure = {
    plain: {value: 'plain', name: 'Plain', selected: true},
    ssl: {value: 'ssl', name: 'SSL', selected: false}
}
Object.freeze(TCP_Server_Secure);

export const TCP_Server_Addr = '0.0.0.0';
export const TCP_Server_Port = {
    value: 8089,
    min: 1025,
    max: 65536    
}
Object.freeze(TCP_Server_Port);

export const TCP_Server_Error = {
    SERVER_NOT_FOUND: {code: 11, message: 'Server not found'},
    CLIENT_NOT_SELECTED: {code: 11, message: 'No clients selected'},
    INVALID_ADDR: {code: 20, message: 'Invalid addr'},
    INVALID_PORT: {code: 21, message: 'Invalid port'},
    INVALID_SECURE: {code: 22, message: 'Invalid secure type'}
}

Object.freeze(TCP_Server_Error);

export const TCP_Server_Events = {
    OPEN: 'open socket',
    CLOSE: 'close socket',
    STATUS: 'status socket',
    CLOSE_CLIENT: 'close client',
    ERROR: 'error',
    SERVER_ERROR: 'server error',
    UPDATE: 'update server',
    KEEPALIVE: 'keepalive config'
};
Object.freeze(TCP_Server_Events);

export const TCP_Server_Keepalive = {
    keepalive: false,
    idle: 7200,
    interval: 75,
    count: 9
}
Object.freeze(TCP_Server_Keepalive);
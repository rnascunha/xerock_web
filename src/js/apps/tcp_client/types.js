export const TCP_Client_Secure = {
    plain: {value: 'plain', name: 'Plain', selected: true},
    ssl: {value: 'ssl', name: 'SSL', selected: false}
}
Object.freeze(TCP_Client_Secure);

export const TCP_Client_Addr = '127.0.0.1';
export const TCP_Client_Port = {
    value: 8089,
    min: 1025,
    max: 65535    
}
Object.freeze(TCP_Client_Port);

export const TCP_Client_Error = {
    NOT_FOUND: {code: 11, message: 'Client not found'},
    NOT_SELECTED: {code: 11, message: 'No clients selected'},
    INVALID_ADDR: {code: 20, message: 'Invalid addr'},
    INVALID_PORT: {code: 21, message: 'Invalid port'},
    INVALID_SECURE: {code: 22, message: 'Invalid secure type'}
}
Object.freeze(TCP_Client_Error);

export const TCP_Client_Events = {
    OPEN: 'open socket',
    CLOSE: 'close socket',
    STATUS: 'status socket',
    ERROR: 'error',
    SERVER_ERROR: 'server error',
    UPDATE: 'update server',
    KEEPALIVE: 'keepalive config'
};
Object.freeze(TCP_Client_Events);

export const TCP_Client_Keepalive = {
    keepalive: false,
    idle: 7200,
    interval: 75,
    count: 9
}
Object.freeze(TCP_Client_Keepalive);
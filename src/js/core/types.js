export const App_Events = {
    SEND_MESSAGE: 'send message',               //Used to send a message. arg = message
    INPUT_REGISTER: 'input register',           //Used to register the app inputs. arg = [...ids]
    RECEIVED_MESSAGE: 'received message',       //Received message. arg = message
    SENT: 'sent',                               //Message sent to the daemon. arg =message
    SHOW_MESSAGE: 'show message',               //Show message at output. arg message
    SERVER_NAME_CHANGE: 'server name change',   //Server name change
    CLOSE_SERVER: 'close server',               //Websocket close
    SERVER_CONNECTED: 'server connected',       //Connection request
    ADD_CONNECTION: 'add connection',
    REMOVE_CONNECTION: 'remove connection',
    ADD_APP: 'new app added',
    ADD_LOCAL_APP: 'new local pp added',
};
Object.freeze(App_Events);

export const Message_Info = {
    ID: 'id',
    ID_STRING: 'id_str',
    FROM: 'from',
    FROM_STRING: 'from_str',
    DATA_OUTPUT: 'data_output',
    DATA_FIELD: 'data_field',
}
Object.freeze(Message_Info);

export const Protocol_Conn = {
    plain: {value: 'ws', name: 'Plain'},
    secure: {value: 'wss', name: 'SSL'}
};
Object.freeze(Protocol_Conn);

export const default_connect_addr = '127.0.0.1';
export const default_connect_port = 8080;

export const Custom_Paint_Type = {
    CONFIG_SEND: 'config_send',
    CONFIG_RECEIVED: 'config_recv',
    RECEIVED: 'received',
    SENT: 'sent'
};
Object.freeze(Custom_Paint_Type);

export const default_options = { app_custom_paint: false }

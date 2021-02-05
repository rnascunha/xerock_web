
export const Server_Events = {
    POST_MESSAGE: Symbol('post message'),
    STATUS_MESSAGE: Symbol('status message'),
    CONFIG_MESSAGE: Symbol('config message'),
    REGISTER_INPUTS: Symbol('register inputs'),
    CLOSE: Symbol('close'),
    SERVER_NAME_CHANGE: Symbol('server_name_change'),
    SET_AUTOCONNECT: Symbol('set autoconnect'),
    RECEIVED_MESSAGE: Symbol('received message'),
    APP_NOT_FOUND: Symbol('app not found'),
    ADD_APP: Symbol('new app added'),
    UPDATE_SESSION: Symbol('update session'),
    SAVE_CONNECTION: Symbol('save connection')
}
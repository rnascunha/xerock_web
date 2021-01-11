export const Script_Events = {
    UPDATE_INPUTS: Symbol('update_inputs'),
    RECEIVED_MESSAGE: Symbol('received message'),
    CHECK_IDS: Symbol('check_ids'),
};
Object.freeze(Script_Events);

export const Script_Result_Status = {
    COMPLETED: 'completed',
    ERROR: 'error'
}
Object.freeze(Script_Result_Status);


export const Script_Errors = {
    NO_INPUT: 'No input defined',
    BUTTON_CANCEL: 'button cancelled',
    SCRIPT_RUNNING: 'Script already running',
    ID_REMOVED: 'id removed',
    SERVER_DISCONNECT: 'server disconnected',
    APP_UNREGISTERED: 'app unregistered'
}
Object.freeze(Script_Errors);

export const polling_default_ms = 100;


export const Select_Events = {
    SET_SELECTED: Symbol('set selected'),
    RENDER_DATA: Symbol('render data')
}

export const Set_Select_Type = {
    ADD: Symbol('add'),
    REMOVE: Symbol('remove')
}
Object.freeze(Set_Select_Type);

export const columns = {
    session: {value: 'session', name: 'session', description: 'Server Session', default: false},
    mid: {value: 'mid', name: 'mid', description: 'Data ID', default: false},
    smid: {value: 'smid', name: 'smid', description: 'Server Data ID', default: false},
    uid: {value: 'uid', name: 'uid', description: 'User ID', default: false},
    sid: {value: 'sid', name: 'sid', description: 'Server ID', default: true},
    sname: {value: 'sname', name: 'sname', description: 'Server Name', default: false},
    saddr: {value: 'saddr', name: 'saddr', description: 'Server Address', default: false},
    time: {value: 'time', name: 'time', description: 'Data Date/Time', default: true},
    app: {value: 'app', name: 'app', description: 'App Name', default: true},
    type: {value: 'type', name: 'type', description: 'Data Type', default: true},
    id: {value: 'id', name: 'id', description: 'App ID/Control Type', default: true},
    dir: {value: 'dir', name: 'dir', description: 'Data Direction', default: true},
    from: {value: 'from', name: 'from/to', description: 'From/To', default: true},
    size: {value: 'length', name: 'size', description: 'Payload Size', default: true},
    payload: {value: 'payload', name: 'payload', description: 'Payload', default: true}
}
//Object.freeze(columns);

export const columns_all = Object.keys(columns);
export const columns_default = columns_all.filter(c => columns[c].default);

export const select_default = columns_default;

export const html = `
<style>
    .sel-button{
        padding: 2px 5px;
        display: inline-block;
        cursor: pointer;
        outline: none;
    }

    .sel-button:hover
    {
        filter: brightness(115%);
    }

    .sel-button:first-child
    {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
    }

    .sel-button:last-child
    {
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
    }

    .sel-unselected{
        border-style: outset;
    }

    .sel-selected{
        border-style: inset;
        background-color: darkgray;
        color: white;
    }
</style>
<div id=container></div>`;
import {Message_Type, Message_Direction} from '../message_factory.js';

export const filter_option_list = {
    sid: {value: 'sid', name: 'sid', decription: 'Server ID' },
    dir: {value: 'dir', name: 'dir', description: 'Message Direction'},
    type: {value: 'type', name: 'type', description: 'Message Type'},
    ctype: {value: 'ctype', name: 'ctype', description: 'Control Type'},
    session: {value: 'session', name: 'session', description: 'Server ID session'},
    appf: {value: 'appf', name: 'appf', description: 'Applications'}
}

export const base_filter_opts_template = {
    [filter_option_list.sid.value]: {},
    [filter_option_list.dir.value]: Object.keys(Message_Direction),
    [filter_option_list.type.value]: Object.keys(Message_Type),
    [filter_option_list.ctype.value]: [],
    [filter_option_list.session.value]: {},
    [filter_option_list.appf.value]: []
}

export const filter_default_opts = {
    commands: true,
    clear: true,
    recursive: true,
    recursive_checked: true,
    unselect: false,
    unselect_checked: false
}

export const Filter_Events = {
    SET_FILTER: Symbol('set filter'),
    RENDER_FILTER: Symbol('render filter'),
    RENDER_DATA: Symbol('render data')
}
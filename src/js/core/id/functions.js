import {App_ID_Template} from './id_template.js';

export const Check_ID_Error = {
    SERVER_DISCONNECTED: -1,
    APP_UNREGISTERED: -2,
    ID_REMOVED: -3,
}

export function is_id_at_list(id, list)
{
    console.assert(id instanceof App_ID_Template, '"id" argument must be of type App_ID_Template');
    let id_found = null;
    
    if(!(id.server().addr() in list)) return Check_ID_Error.SERVER_DISCONNECTED;
    if(!(id.app().name() in list[id.server().addr()])) return Check_ID_Error.APP_UNREGISTERED;
    list[id.server().addr()][id.app().name()].some(nid => {
        if(id.compare_ids(nid))
        {
            id_found = nid;
            return true;
        }
    });
    
    return id_found ? id_found : Check_ID_Error.ID_REMOVED;
}
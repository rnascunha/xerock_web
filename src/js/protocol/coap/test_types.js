import {option} from './types.js';

export function is_valid_token(token)
{
    if(!(token instanceof Array)) return false;
    if(token.length > 8) return false;
    return true;
}

export function is_valid_type(type)
{
    if(typeof type != 'number') return false;
    if(!Number.isInteger(type)) return false;
    if(!(type >= 0 && type <= 3)) return false;
    return true;
}

export function is_valid_code(code)
{
    if(typeof code != 'number') return false;
    if(!Number.isInteger(code)) return false;
    if(!(code >= 0 && code <= 255)) return false;
    return true;
}

export function is_valid_mid(mid)
{
    if(typeof mid != 'number') return false;
    if(!Number.isInteger(mid)) return false;
    if(!(mid >= 0 && mid <= 65535)) return false;
    return true;
}

export function is_valid_options(options, check_repeat = true)
{
    if(!(options instanceof Array)) return false;
    if(!check_repeat) return true;
    
    for(let i = 0; i < (options.length - 1); i++)
    {
        let op = Object.values(option).find(o => o.code == options[i].code);
        if(!op) continue;
        if(op.repeatable) continue;
        for(let j = i + 1; j < options.length; j++)
        {
            if(options[i].code == options[j].code)
            {
                return false;
            }
        }
    }
    return true;
}

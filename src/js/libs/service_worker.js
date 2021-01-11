
export function has_support()
{
    return 'serviceWorker' in navigator;
}

export function register(sw)
{
    if(!has_support()) return null;
    
    return navigator.serviceWorker.register('sw.js');
}

export function event_message(callback)
{
    navigator.serviceWorker.addEventListener('message', callback);
}


//event.path
export function event_path(ev)
{
    return (ev.composedPath && ev.composedPath()) || evt.path;
}

//Browser detection
//https://stackoverflow.com/a/64469284
export let is_chrome = navigator.userAgent.includes("Chrome") && navigator.vendor.includes("Google Inc");
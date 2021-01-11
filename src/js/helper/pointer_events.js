export function event_position(event) 
{
    let posx = 0, posy = 0;

    if (!event) event = window.event;

    if (event.pageX || event.pageY) {
        posx = event.pageX;
        posy = event.pageY;
    } else if (event.clientX || event.clientY) {
        posx = event.clientX + document.body.scrollLeft + 
                document.documentElement.scrollLeft;
        posy = event.clientY + document.body.scrollTop + 
                document.documentElement.scrollTop;
    }

    return {
        x: posx,
        y: posy
    }
}

export function set_menu_position(event, menu, opt = {}) 
{
    let options = {...{borderX: 0, borderY: 0}, ...opt};

    let click_coords = event_position(event),
        click_coordsX = click_coords.x,
        click_coordsY = click_coords.y;

    let menu_width = menu.offsetWidth + options.borderX,
        menu_height = menu.offsetHeight + options.borderY;

    let container_width = window.innerWidth,
        container_height = window.innerHeight;

    if ( (container_width - click_coordsX) < menu_width )
        menu.style.left = container_width - menu_width + "px";
    else
        menu.style.left = click_coordsX + "px";

    if ( (container_height - click_coordsY) < menu_height )
        menu.style.top = container_height - menu_height + "px";
    else
        menu.style.top = click_coordsY + "px";
}

export function check_element_click(e, element) {
    let el = e.srcElement || e.target;

    if (el == element)
        return el;
    else{
        while ( el = el.parentNode ) {
            if (el == element)
                return el;
        }
    }

    return false;
}
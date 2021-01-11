customElements.define('drop-menu', class extends HTMLElement {
    constructor()
    {
        super(); // always call super() first in the ctor.

        // Create shadow DOM for the component.
        this._shadow = this.attachShadow({mode: 'open'});
        this._shadow.innerHTML = `
            <style>
            :host{
                display: inline-block;
                z-index: 1;
                position: relative;
            }

            #title{
                display: inline-flex;
                justify-content: space-between;
                background-color: var(--drop-menu-title-bg, blue);
                color: var(--drop-menu-title-color, white);
                padding: var(--drop-menu-title-padding, 5px);
            }

            #window-icon:after{
                content: var(--drop-menu-title-icon, "\u25BC");
            }

            :host(:hover) #title{
                background-color: var(--drop-menu-title-bg-hover, red);
                color: var(--drop-menu-title-color-hover, auto);
            }

            #content{
                position: absolute;
                bottom: var(--drop-menu-content-bottom, auto);
                left: var(--drop-menu-content-left, auto);
                display: none;
                background-color: var(--drop-menu-content-bg, #ddd);
                cursor: var(--drop-menu-content-cursor, pointer);
                z-index: 1;
                min-width: var(--drop-menu-content-min-width, auto);
                padding: var(--drop-menu-title-padding, 2px 15px);
            }

            :host(:hover) #content{
                display: block;
            }
            </style>
            <div id=title>
                <span id=title-name>
                    <slot name=title>Menu</slot>
                </span>
                <span id=window-icon></span>
            </div>
            <div id=content>
                <slot></slot>
            </div>`;
    }
});
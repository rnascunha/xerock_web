customElements.define('my-draggable', class extends HTMLElement {
    constructor()
    {
        super(); // always call super() first in the ctor.
        
        // Create shadow DOM for the component.
        this._shadow = this.attachShadow({mode: 'open'});
        this._shadow.innerHTML = `
            <style>
            :host{
                position: absolute;
                z-index: 7;
                min-width: fit-content;
            }

            #title{
                display: flex;
                justify-content: space-between;
                cursor: move;
                z-index: 10;
                background-color: blue;
                font-weight: bold;
                padding: 3px;
                border: 1px solid black;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
            }

            #window-close{
                cursor: pointer;
                 padding: 0px 5px 0px 5px;
            }

            #window-close:hover{
               background-color: white;
            }

            #content{
                background-color: aliceblue;
                border-bottom: 1px solid black;
                border-left: 1px solid black;
                border-right: 1px solid black;
                border-bottom-left-radius: 5px;
                border-bottom-right-radius: 5px;
            }
            </style>
            <div id=title>
                <span id=title-name><slot name=title>Title</slot></span><span id=window-close>&times;</span>
            </div>
            <div id=content><slot><p>teste</p></slot></div>`;
    }
    
    connectedCallback()
    {
        this.dragElement(this);
        
        this._shadow.querySelector('#window-close').onclick = ev => {
            this.dispatchEvent(new Event('close'));
            this.outerHTML = '';
        }
        
        this.position();
    }
    
    dragElement(elmnt) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
        elmnt._shadow.querySelector('#title').onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    
    position(pos = 'top')
    {
        switch(pos){
            case 'middle':
            {
                let wwidth = window.innerWidth,
                    wheight = window.innerHeight,
                    w = this.offsetWidth,
                    h = this.offsetHeight;

                let left = (wwidth - w) / 2,
                    top = (wheight - h) / 2;

                this.style.top = top + 'px';
                this.style.left = left + 'px';
            }
            case 'top':
            {
                this.style.top = '5px';
                this.style.left = '5px';
            }
        }
    }
});
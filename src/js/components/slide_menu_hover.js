class Slide_Menu_Hover extends HTMLElement{
    constructor(dir = 'right'){
        console.assert(dir === 'right' || dir === 'left' || dir === 'top' || dir === 'bottom',
                      '"dir" not valid');
        super();
        
        if(!this.hasAttribute('dir')) this.dir = dir;
    }
    
    connectedCallback(){
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
<style>
:host{
  position: fixed; /* Stay in place */
  z-index: 10; /* Stay on top */
  background-color: cadetblue; /* Black*/
  overflow-x: hidden; /* Disable horizontal scroll */
  transition: 0.5s; /* 0.5 second transition effect to slide in the sidenav */
}

:host([dir=right]){  
  height: 100%; /* 100% Full-height */
  width: 300px; /* 0 width - change this with JavaScript */
  top: 0; /* Stay at the top */
  left: -290px;
}

:host([dir=right]:hover){
    left: 0;
}

:host([dir=left]){  
  height: 100%; /* 100% Full-height */
  width: 300px; /* 0 width - change this with JavaScript */
  top: 0; /* Stay at the top */
  right: -290px;
}

:host([dir=left]:hover){
    right: 0;
}

:host([dir=top]){  
  height: 300px; /* 100% Full-height */
  width: 100%; /* 0 width - change this with JavaScript */
  top: -290px; /* Stay at the top */
  right: 0;
}

:host([dir=top]:hover){
    top: 0;
}

:host([dir=bottom]){  
  height: 300px; /* 100% Full-height */
  width: 100%; /* 0 width - change this with JavaScript */
  bottom: -290px; /* Stay at the top */
  right: 0;
}

:host([dir=bottom]:hover){
    bottom: 0;
}
</style>
<div class="content">
    <slot></slot>
</div>
`;
    }
    
    set dir(val){
        console.assert(val === 'right' || val === 'left' || val === 'top' || val === 'bottom',
                      '"val" not valid');
        
        this.removeAttribute('dir');
        this.setAttribute('dir', val);
    }
}

customElements.define('my-slide-menu-hover', Slide_Menu_Hover);
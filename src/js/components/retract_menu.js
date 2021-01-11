class Retract_Menu extends HTMLElement{
    constructor(show = true){
        super();
     
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
<style>
:host{
    display: block;
}

#title{
    cursor: pointer;
    font-size: 2ch;
    padding: 3px;
    margin: 3px;
    text-align: var(--my-retract-title-align, inherit);
    color: var(--my-retratct-title-color, inherit);
}

.content{
    background-color: var(--my-retract-content-bg, inherit);
    padding: var(--my-retract-content-padding, inherit);
    margin: var(--my-retract-content-margin, inherit);
}

.show{
    transition: max-height .3s ease-in, transform .3s ease-in;  
    transform: scaleY(1);
    max-height: 1000px;
}

.close{
    transition: max-height .3s ease-out, transform .3s ease-out;  
    transform: scaleY(0);
    max-height: 0;
}

/*
.show{
    display: block;
}

.close{
    display: none;
}
*/

.icon-show{
    content: '&larr;';
}
</style>
<slot id=title name=title></slot>
<div class=content>
    <slot></slot>
</div>
`;
        this.content = shadowRoot.querySelector('.content');
        this.content.onclick = (event) => {
            event.stopPropagation();
        }
                
        shadowRoot.querySelector('#title').onclick = (event) => {
            this.toggle();
        }
        
        this.show = Boolean(show);
    }
    
    connectedCallback()
    {
        if(this.hasAttribute('show'))
            this.show = Boolean(this.getAttribute('show'));
    }
    
    set show(val){
        this._show = Boolean(val);
        if(this._show){
            this.content.classList.remove('close');
            this.content.classList.add('show');
        }
        else{
            this.content.classList.remove('show');
            this.content.classList.add('close');
        }
    }
    
    get show(){
        return this._show;
    }
    
    toggle(){
        this.show = !this._show;
    }
}

customElements.define('my-retract-menu', Retract_Menu);
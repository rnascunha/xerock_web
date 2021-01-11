class Modal extends HTMLElement{
    constructor(){
        super();        
    }
    
    connectedCallback(){
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
<style>
:host 
{
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 10; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: hidden; /* Enable scroll if needed */
    background-color: var(--my-modal-bg, rgb(0,0,0)); /* Fallback color */
    background-color: var(--my-modal-bg, rgba(0,0,0,0.4)); /* Black w/ opacity */
    /* https://stackoverflow.com/a/61421444 */
    justify-content: center;
    align-items: center;
}

/* Modal Content/Box */
.content 
{
    position: relative;
    background-color: var(--my-modal-content-bg, #fefefe);
    margin: var(--my-modal-content-margin, 10% auto);   
    border: var(--my-modal-content-border, 2px solid #888);
    width: var(--my-modal-content-width, 80%); /* Could be more or less, depending on screen size */
    height: var(--my-modal-content-height, 80%); /* Could be more or less, depending on screen size */
    box-sizing: border-box;
    border-radius: 15px;
}

/* The Close Button */
.close 
{
    color: var(--my-modal-close-color, #aaa);
    position: absolute;
    right: 10px;
    top: 5px;
    font-size: var(--my-modal-close-font-size, 28px);
    font-weight: bold;
    cursor: pointer;
    z-index: 15;
}

.close:hover,
.close:focus 
{
  color: var(--my-modal-close-focus-color, black);
  text-decoration: none;
}
</style>
<div class=content>
    <span class=close>&times;</span>
    <slot></slot>
</div>
`;
        shadowRoot.querySelector('.content').onclick = (event) => {
            event.stopPropagation();
        }
        
        let event_close = new Event('close');
        shadowRoot.querySelector('.close').onclick = () => {
            this.dispatchEvent(event_close);
            this.style.display = 'none';
        }
        
        this.onclick = (event) => {
            this.dispatchEvent(event_close);
            if (event.target == this) {
                this.style.display = "none";
            }
        } 
    }
    
    set show(val){
        if(val)
            this.style.display = 'flex';
        else
            this.style.display= 'none';
    }
}

customElements.define('my-modal', Modal);
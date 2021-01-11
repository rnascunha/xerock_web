import {Message_Factory, Message_Type, Control_Type} from '../core/libs/message_factory.js';
import {App_List} from '../apps/app_list.js';

(function(){

const template = document.createElement('template');
template.innerHTML =`
<style>
    :host
    {
        padding: 5px;
        display: inline-flex;
        flex-direction: column;
        align-items: strech;
    }

    label{
        font-weight: bold;
    }

    #payload
    {
        min-height: 100px;
    }

    .input
    {
        width: 100%;
        box-sizing: border-box;
        padding: 3px;
    }

    .flex-item
    {
        width: 100%;
        margin-bottom: 3px;
    }

</style>
<label class=flex-item>App: <input class=input id=app list=app-list></label>
<datalist id=app-list></datalist>
<label class=flex-item>Type: <select  class=input id=type></select></label>
<label class=flex-item>Control Type: <select  class=input id=ctype></select>
<div class=flex-item>
    <div>Data:</div>
    <textarea id=payload class=input></textarea>
</div>`;
    
(function()
{    
    const type = template.content.querySelector('#type'),
        ctype = template.content.querySelector('#ctype'),
        app_list = template.content.querySelector('#app-list');
    
    Object.values(App_List).forEach(a => {
        let op = document.createElement('option');
        op.value = a.name;
        op.textContent = a.name;
        
        app_list.appendChild(op);
    });
    
    Object.values(Message_Type).forEach(t => {
        let op = document.createElement('option');
        op.value = t.value;
        op.textContent = t.name;
        
        type.appendChild(op);
    });
    
    Object.values(Control_Type).forEach(c => {
        let op = document.createElement('option');
        op.value = c.value;
        op.textContent = c.name;
        
        ctype.appendChild(op);
    });
})();

customElements.define('json-message', class extends HTMLElement {
    constructor()
    {
        super();

        const shadow = this.attachShadow({mode: 'open'});
        shadow.appendChild(template.content.cloneNode(true));
        
        this._type = shadow.querySelector('#type'),
        this._ctype = shadow.querySelector('#ctype'),
        this._app = shadow.querySelector('#app'),
        this._app_list = shadow.querySelector('#app_list');
        this._payload = shadow.querySelector('#payload');
        
        this._ctype.disabled = true;
        this._type.addEventListener('change', ev => {
            this._ctype.disabled = this._type.selectedOptions[0].value === Message_Type.data.value;
        });
    }
    
    connectedCallback()
    {
        
    }
    
    get type(){ return this._type.selectedOptions[0].value; }
    get ctype(){ return this._ctype.selectedOptions[0].value; }
    get app(){ return this._app.value; }
    
    get payload()
    { 
        let value = this._payload.value;
        try{
            return JSON.parse(value);
        }catch(e){
            return value;
        }
    }
    
    message()
    {
        return Message_Factory.create(this.app, this.type, this.ctype, this.payload);
    }
});
    
})();
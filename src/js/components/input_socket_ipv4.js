const Protocols = {
    plain: {value: 'plain', name: 'Plain'},
    secure: {value: 'secure', name: 'Secure'},
}

export class Input_Socket_IPv4 extends HTMLElement {
    constructor(protocols = Protocols)
    {
        super(); // always call super() first in the ctor.

        // Create shadow DOM for the component.
        this.shadow_root = this.attachShadow({mode: 'open'});
        this.shadow_root.innerHTML = `
                <style>
                :host{
                    display: inline-flex;
                    align-items: center;
                    border-style: solid;
                    border-width: 1px;
                    border-radius: 5px;
                    position: relative;
                }

                #protocol-select{
                    border-radius: 5px;
                    background-color: var(--input-socket-ipv4-bg, antiquewhite);
                }

                #protocol-select:focus-within{
                    outline: 1px solid lightgrey;
                }

                #ip-addr{
                    margin: 1px;
                    border-radius: 5px;
                    --input-ipv4-padding: 0px 0px;
                    --input-ipv4-margin: 0px;
                    --input-ipv4-border: transparent 0px;
                    --input-ipv4-width: 15ch;
                    --input-ipv4-outline: none;
                    --input-ipv4-bg: var(--input-socket-ipv4-bg, antiquewhite);
                    background-color: var(--input-socket-ipv4-bg, antiquewhite);
                }

                #ip-addr:focus-within{
                    outline: 1px solid lightgrey;
                }

                #port{
                    width: 8ch;
                    border-color: transparent;
                    margin: 2px;
                    border-radius: 5px;
                    background-color: var(--input-socket-ipv4-bg, antiquewhite);
                }

                #port:focus-within{
                    outline: 1px solid lightgrey;
                }

                .field{
                    padding: 5px 0px;
                }

                #list-container{
                    position: absolute;
                    padding: 5px 2px;
                    border-radius: 5px;
                    top: 33px;
                    background-color: lightgray;
                    width: 100%;
                }

                #list{
                    list-style-type: none;
                }

                .list-op{
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .list-op:hover{
                    background-color: beige;
                }

                .field-op-content
                {
                    flex-grow: 4;
                }

                .field-op-close{
                    background-color: transparent;
                    color: red;
                    padding: 1px 5px;
                    border-radius: 15px;
                }

                .field-op-close:after{
                    content: '\D7';
                }

                .field-op-close:hover{
                    background-color: red;
                    color: white;
                }
                </style>
                <select id=protocol-select class='field field-protocol'>
                    <slot name=protocol></slot>
                </select>
                <div class='field field-protocol'>://</div>
                <input-ipv4 id=ip-addr class=field></input-ipv4>
                <div class=field>:</div>
                <input id=port type=number min=0 max=65535 class=field>
                <div id=list-container></div>
                <slot></slot>
            `;
                
        this._select = this.shadow_root.querySelector('#protocol-select');
        this._addr = this.shadow_root.querySelector('#ip-addr');
        this._port = this.shadow_root.querySelector('#port');
        this._list_el = this.shadow_root.querySelector('#list-container');
        
        this.render(protocols);
        
        if(this.hasAttribute('ip'))
            this.ip(this.getAttribute('ip'));
        
        if(this.hasAttribute('port'))
            this.port(this.getAttribute('port'));
        
        if(this.hasAttribute('protocol'))
            this.protocol(this.getAttribute('protocol'));
        
        if(this.hasAttribute('addr-disabled'))
            this.ip_disabled(this.getAttribute('addr-disabled'));
        
        this._list = [];
        
        this.addEventListener('mouseover', this.show_list.bind(this), false);
        this.addEventListener('mouseout', this.hide_list.bind(this), false);
        
        this.hide_list();
    }
    
    is_valid()
    {
        return this._addr.is_valid() && (this._port.value > 0 && this._port.value <= 65535);
    }
        
    show_list(ev)
    {
        if(!this._list.length) return;
        this._list_el.style.display = 'block';
    }
    
    hide_list(ev)
    {
        this._list_el.style.display = 'none';
    }
    
    add(protocol = null, addr = null, port = null)
    {
        let data;
        if(protocol == null && addr == null && port == null)
            data = {protocol: this.protocol(), ip: this.ip(), port: this.port()}
        else 
            data = {protocol: protocol, ip: addr, port: port};        
        
        let finded = this._list.find(sock => sock.protocol == data.protocol && sock.ip == data.ip && sock.port == data.port);
        
        if(!finded){
            this._list.push(data);
            this._render_list();
            this.dispatchEvent(new CustomEvent('added', {detail: data}));
        }
    }
    
    remove(protocol, addr, port)
    {
        this._list = this._list.filter(sock => !(sock.protocol == protocol && sock.ip == addr && sock.port == port));
        this._render_list();
        this.dispatchEvent(new CustomEvent('removed', {detail: {protocol: protocol, ip: addr, port: port}}));
    }
    
    clear()
    {
        this._list = [];
        this._render_list();
        this.dispatchEvent(new Event('clear'));
    }
    
    render(protocols = null)
    {
        if(!protocols)
        {
            this.shadow_root.querySelectorAll('.field-protocol').forEach(field => field.style.display = 'none');
            return;
        }
        
        this._select.innerHTML = '';
        Object.values(protocols).forEach(proto => {
            let op = document.createElement('option');
            op.value = proto.value;
            op.textContent = proto.name;
            
            this._select.appendChild(op);
        });
    }
    
    ip(addr = null)
    {
        if(addr != null)
            this._addr.value = addr;
        
        return this._addr.value;
    }
    
    ip_disabled(disable = null)
    {
        if(disable !== null)
            this._addr.disabled = Boolean(disable);
        
        return this._addr.disabled;
    }
    
    port(port_ = null)
    {
        if(port_ != null)
            this._port.value = port_;
        
        return this._port.value;
    }
    
    protocol(proto = null)
    {
        if(proto != null){
            this._select.querySelectorAll('option').forEach((op, idx) => {
                if(op.value == proto)
                    this._select.selectedIndex = idx;
            });
        }
        
        if(this._select.selectedIndex == -1) return null;
        return this._select.options[this._select.selectedIndex].value;
    }
    
    _render_list()
    {        
        this._list_el.innerHTML = '';
        if(!this._list.length){
            this.hide_list();
            return;
        }
        
        let list = document.createElement('lu');
        list.setAttribute('id', 'list');
        
        this._list.forEach(op => {
            let li = document.createElement('li');
            li.setAttribute('class', 'list-op');
            
            let content = document.createElement('div'); 
            
            content.value = JSON.stringify(op);
            content.textContent = `${op.protocol}://${op.ip}:${op.port}`;
            content.setAttribute('class', 'field-op-content');
            
            
            content.onclick = ev => {
                this.protocol(op.protocol);
                this.ip(op.ip);
                this.port(op.port);
                
                this.dispatchEvent(new CustomEvent('selected', {detail: op}));
                
                this.hide_list();
            }
            li.appendChild(content);
            
            let close = document.createElement('div');
            close.setAttribute('class', 'field-op-close');
            
            close.onclick = ev => {
                this.remove(op.protocol, op.ip, op.port);
            }
            li.appendChild(close);
            
            list.appendChild(li);
        })
        
        this._list_el.appendChild(list);
    }
}

customElements.define('input-socket-ipv4', Input_Socket_IPv4);
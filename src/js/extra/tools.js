const default_opts = "menubar=no,status=no,toolbar=no";

export class Tool_Template
{
    constructor(name, link, options = "")
    {
        this._name = name;
        this._link = link;
        this._options = default_opts;
        if(typeof options === 'string' && options)
            this._options += ',' + options;
    }
    get name(){ return this._name; }
    get link(){ return this._link; }
    
    open()
    {
//        window.open(this.link, '_blank', this._options);
        window.open(this.link, '_blank', "");
    }
}

export class Tools 
{
    constructor(container, tools = [])
    {
        this._container = container;
        this._tools = tools;
        
        this.render();
    }
    
    register(tool)
    {
        console.assert(tool instanceof Tool_Template, 'Not a tool class');
        
        if(this._tools.find(t => t.name === tool.name))
        {
            console.warn(`Tool ${tool.name} already registered`);
            return;
        }
        
        this._tools.push(tool);
        this.render_new_tool(tool);
    }
    
    render()
    {
        this._container.title = 'Tools';
        this._container.innerHTML = '<option>&#x1f6e0;</option>';
        
        this._container.onchange = ev => {
            this._tools.find(t => t.name === this._container.selectedOptions[0].value).open();
            this._container.selectedIndex = 0;
        }
    }
    
    render_new_tool(tool)
    {
        let op = document.createElement('option');
        op.textContent = tool.name;
        op.value = tool.name;
        
        this._container.append(op);
    }
}
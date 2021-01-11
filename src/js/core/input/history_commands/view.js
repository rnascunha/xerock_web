export class Hitory_Commands_View
{
    constructor(model, container)
    {
        this._model = model;
        this._container = container;
        
        this._model.on('render', () => this.render())
                    .on('set index', index => this.set_index(index));
        
        this._container.addEventListener('click', ev => {
            this._model.set(ev.path[0].value);
        });
        this._container.addEventListener('dblclick', ev => {
            this._model.set(ev.path[0].value, true);
        });
        this._container.addEventListener('keyup', ev => {
           if(ev.key === 'ArrowDown' || ev.key === 'ArrowUp')
               this._model.set(ev.target.selectedIndex);
            else if(ev.key === 'Enter')
                this._model.set(ev.target.selectedIndex, true);
            else if(ev.key === 'Delete')
                this._model.remove(ev.target.selectedIndex);
        });
    }
    
    render()
    {
        this._container.innerHTML = "";
        this._model._recent_list.forEach((comm,idx) => {
            let op = document.createElement('option');
            op.value = idx;
            op.textContent = `(${comm.type})|${comm.data}`;
            op.title = `(${comm.type})|${comm.data}`;
            
            this._container.appendChild(op);
            if(idx == this._model._index) op.selected = true;
            
            this._container.scrollTop = this._container.scrollHeight;
        });
    }
    
    set_index(index)
    {
        this._container.selectedIndex = index;
    }
}
export class Commands_View
{
    constructor(model, container)
    {
        this._model = model;
        this._container = container;
        
        this._model.on('render', () => this.render())
    }
    
    render()
    {
        this._container.innerHTML = '<option class=command-disabled>Commands</option>';
        let list = this._model._list;
        if(list.length == 0)
        {
            let op =  document.createElement('option');
            op.setAttribute('class', 'command-call');
            op.textContent = 'No command register';
            this._container.appendChild(op);

            return;
        }
        
        list.forEach(comm => {
           let op =  document.createElement('option');
            op.setAttribute('class', 'command-call');
            op.textContent = comm.name();
            this._container.appendChild(op);
        });
        
        this._container.onchange = event => {
            if(event.target.selectedIndex === 0) return;
            
            let comm_name = event.target.selectedOptions[0].textContent;
            let comm = list.find(c => c.name() == event.target.selectedOptions[0].textContent);
            if(!comm){
                console.error(`Command '${comm_name}' not found`);
                return;
            }
            
            event.target.selectedIndex = 0;
            if(!comm.open()){
                let window = document.createElement('my-draggable');

                window.innerHTML = `<span slot=title>${comm.name()}</span>`;
                let div = document.createElement('div'),
                    shadow = div.attachShadow({mode: 'open'});
                shadow.appendChild(comm.render());
                window.appendChild(div);

                window.addEventListener('close', event => {
                   comm.open(false); 
                });

                document.body.appendChild(window);
                comm.open(true);
            } else 
                console.warn('Command window ' + comm.name() + ' already opened');
        }
    }
}
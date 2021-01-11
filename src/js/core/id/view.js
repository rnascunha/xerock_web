import {Event_Emitter} from '../../libs/event_emitter.js';
import {Register_ID_Events} from './types.js';

export class Register_ID_View extends Event_Emitter
{
    constructor(model, container)
    {
        super();
        
        this._model = model;
        this._container = container;
        
        this._model.on(Register_ID_Events.RENDER, list => this.render(list));
        
        this._container.onchange = ev => {
            this._container.title = this._model._id_from_value(ev.target.options[ev.target.selectedIndex].value).full_name();
            this.emit(Register_ID_Events.CHANGE_ID, 
                      ev.target.options[ev.target.selectedIndex].value);
        }
        
        //Observe add/remove elements from the
        let observer = new MutationObserver(mut => {
            let last_mut = mut[mut.length - 1]; 
            this.emit(Register_ID_Events.CHANGE_ID, 
                      this._check_selected(last_mut.target.options[last_mut.target.selectedIndex]));
            observer.takeRecords(); 
        });
        observer.observe(this._container, {childList: true});
    }
    
    render(list)
    {
        this._container.innerHTML = '';
        
        let nlist = this._model.list(), has_id = false;
        Object.keys(nlist).forEach(addr => {
            Object.keys(nlist[addr]).forEach(app => {
                if(!nlist[addr][app].length) return;
                
                let opt_group = document.createElement('optgroup');
                opt_group.label = `${addr}:${app}`;
                nlist[addr][app].forEach(id => {
                    let op = document.createElement('option');
                    op.textContent = id.name();
                    op.value = this._model.make_value(id);
                    op.title = id.full_name();
                    
                    if(this._model.selected() && id.is_equal(this._model.selected()))
                    {
                        op.selected = true;
                        this._container.title = id.full_name();
                    }
                    opt_group.appendChild(op);
                    has_id = true;
                });
                this._container.appendChild(opt_group);
            });
        });
        
        if(!has_id)
        {
            let op = document.createElement('option');
            op.classList.add('no-id-avaliable');
            op.textContent = 'No ID avaliable';
            op.value = 'null';
            this._container.title = '';
            
            this._container.appendChild(op);
        }
    }
    
    _check_selected(op)
    {
        return op ? op.value : op;
    }
}
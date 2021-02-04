import {Event_Emitter} from '../../../libs/event_emitter.js';
import {View_Events, html_view} from './types.js';
import {Register_ID_Events} from '../../id/types.js';

export class View_View extends Event_Emitter
{
    constructor(model, container)
    {
        super();
        
        this._model = model;
        this._container = container;
        
        this._container.addEventListener('change', ev => {
            this.emit(View_Events.OPEN_VIEW, this._container.selectedOptions[0].value);
            this._container.selectedIndex = 0;
        });
        
        this._model.on(View_Events.REGISTER_VIEW, view_name => this.render())
                    .on(View_Events.OPEN_VIEW, view => this.open_view(view));
        
        this.render();
        
        window.addEventListener('beforeunload', ev => {
            this._model.opened_views.forEach(view => view.window().close());
        });
    }
    
    render()
    {
        this._container.innerHTML = '';
        if(Object.keys(this._model._views).length === 0)
        {
            let op = document.createElement('option');
            op.textContent = 'No views';
            op.style.display = 'none';
            
            this._container.appendChild(op);
            
            return;
        }
        
        let op = document.createElement('option');
        op.value = 'null';
        op.textContent = 'Views';
        op.style.display = 'none';
        this._container.appendChild(op);
        Object.keys(this._model._views).forEach(view => {
            let op = document.createElement('option');
            op.value = view;
            op.textContent = view;
            this._container.appendChild(op);
        });
    }
    //toolbar=yes,top=500,left=500,width=900,height=400
    open_view(view)
    {
        let win_opt = "scrollbars=yes,resizable=yes";
        if(window.screen)
        {   
            let percent = 80;
            win_opt += `,width=${Math.floor(window.screen.availWidth * percent / 100)}`;
            win_opt += `,height=${Math.floor(window.screen.availHeight * percent / 100)}`;
        }
        let win_view = window.open("", "_blank", win_opt);
                
        win_view.document.open();
        win_view.document.write(html_view(view.name));
        win_view.document.close();        
        
        view.window(win_view);
        view.render(win_view.document.body);

        win_view.addEventListener('unload', ev => this.emit(View_Events.REMOVE_VIEW, view));
    }
}
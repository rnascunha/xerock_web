import {Custom_Filter} from './custom_filters.js';
import {Event_Emitter} from '../../../libs/event_emitter.js';
import {Output_Style_Events} from './types.js';
import {copy} from '../../../helper/object_op.js';
import {Filter_Events} from '../filter/types.js';

export class Output_Filter extends Event_Emitter
{
    constructor(prefix, prefix_id, style, filter = null, id)
    {
        super();
        
        this._tag = new Custom_Filter(prefix, prefix_id, style);
        this._filter = filter;
        this._id = id;
        
        if(filter)
        {
            this.on(Filter_Events.RENDER_FILTER, filter_opts => this._filter.filter_options(filter_opts));
            
            this._filter.on(Filter_Events.RENDER_DATA, () => this.emit(Filter_Events.RENDER_DATA));
            this._filter.on(Filter_Events.RENDER_FILTER, arg => this.emit(Filter_Events.RENDER_FILTER));
        }
        
        this._tag.on('filter_change', () => this.emit(Output_Style_Events.CHANGE_STYLE_VIEW));
    }
    
    id()
    {
        return this._id;
    }
    
    remove()
    {
        this._tag.remove();
    }
    
    configure(element)
    {
        this._tag.configure(element);
    }
    
    style()
    {
        return this._tag.filter();
    }
    
    filter()
    {
        return copy(this._filter.get());
    }
}

import {Data_Model} from './model.js';
import {Data_View} from './view.js';
import {Data} from './controller.js';

export function make_data(container, options = {})
{
    let model = new Data_Model(options);
    return new Data(model, new Data_View(model, container, options));
}
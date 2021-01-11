import {View_Model} from './model.js';
import {View_View} from './view.js';
import {View} from './controller.js';

export function make_view(container, options = {})
{
    let model = new View_Model();
    return new View(model, new View_View(model, container));
}
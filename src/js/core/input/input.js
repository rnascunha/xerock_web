import {Input} from './controller.js';
import {Input_Model} from './model.js';
import {Input_View} from './view.js';

export function make_input(container)
{
    let model = new Input_Model();
    
    return new Input(model, new Input_View(model, container));
}
import {Select_Model} from './model.js';
import {Select_View} from './view.js';
import {Select} from './controller.js';
import {columns_default, columns_all} from './types.js';

export function make_select(container, selected = columns_default, columns = columns_all)
{
    let model = new Select_Model(selected, columns);
    return new Select(model, new Select_View(model, container));
}
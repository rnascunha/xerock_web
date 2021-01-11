import {make_style_element, update_style_element} from './element_config.js';

export class Style_Tag{
    constructor(name, styles = {}){
        this._name = name;
        this._style = make_style_element(name, styles);
    }
    
    element(){
        return this._style;
    }
    
    update(styles){
        update_style_element(this._style, this._name, styles);
    }
}
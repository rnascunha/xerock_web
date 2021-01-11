
export class Adaptative_Table
{
    constructor(rules, headers = {})
    {
        this._rules = rules;
        this._headers = headers;
    }
    
    init()
    {
        Object.values(this._rules).forEach(attr => {
            attr.current = attr.min;
        });
        
        return this;
    }
    
    update_headers(headers){ this._headers = headers; }
    get rules(){ return this._rules; }
    
    set(attr)
    {
        if(attr in this._rules)
            this._headers[attr].style.width = this._rules[attr].current + 'ch';
    }
    
    set_all()
    {
        Object.keys(this._rules).forEach(attr => this.set(attr));
    }
    
    check(attr, cell, options = {add: 2})
    {
        if(!(attr in this._rules)) return;
        
        let len = 0;
        switch(this._rules[attr].type)
        {
            case 'flexible':
                len = cell.textContent.length;
                break;
            case 'break-white-force':
            case 'break-white':
                len = cell.textContent
                                .split(' ')
                                .reduce((acc, value) => value.length > acc ? value.length : acc, 0) 
                break;
        }
        len += options.add;
        
        if('max' in this._rules[attr] &&
            len > this._rules[attr].max) len = this._rules[attr].max;
        
        let update = false;
        switch(this._rules[attr].type)
        {
            case 'flexible':
            case 'break-white':
                if(len > this._rules[attr].current &&
                    len > this._rules[attr].current != this._rules[attr].max)
                    update = true;
                break;
            case 'break-white-force':
                if(len != this._rules[attr].current)
                    update = true;
                break;
        }
        
        if(update)
        {
            this._headers[attr].style.width = len + 'ch';
            this._rules[attr].current = len;
        }
    }
}
import {add_zero} from './helper/util.js';
import {timeFormat} from 'd3-time-format';

export const DATETIME_FORMAT = {
    DATE: {name: 'date', value: 'data', format: '%d/%m/%Y'},
    TIME: {name: 'time', value: 'time', format: '%H:%M:%S'},
    DATETIME: {name: 'date/time', value: 'datetime', format: '%d/%m/%Y %H:%M:%S'},
    EPOCH: {name: 'unix timesptamp', value: 'epoch', format: '%s'},
    ISO: {name: 'UTC-ISO', value: 'iso', format: "%Y-%m-%dT%H:%M:%S.%LZ"}
}

export const TIME_PRECISION = {
    SECONDS: {name: 'seconds', value: 'sec'},
    MILISECONDS: {name: 'miliseconds', value: 'mili'},
    MICROSECONDS: {name: 'microseconds', value: 'micro'},
}

function date_time(value)
{
    let dtf = Object.values(DATETIME_FORMAT).find(f => f.value == value);
    return dtf ? dtf : DATETIME_FORMAT.TIME;
}

export class Date_Time_Format
{   
    static format(time, format = DATETIME_FORMAT.TIME.value, precision = TIME_PRECISION.MILISECONDS.value)
    {
        let milis = Math.floor(time / 1000);
        
        let str = (timeFormat(date_time(format).format))(milis);
        
        if(format === DATETIME_FORMAT.ISO.value 
          || format === DATETIME_FORMAT.DATE.value)
            return str;
        
        let rest = '';
        switch(precision)
        {
            case TIME_PRECISION.MICROSECONDS.value:
                rest += `.${add_zero(time % 1000000, 6)}`;
                break;
            case TIME_PRECISION.MILISECONDS.value:
                rest = `.${add_zero(milis % 1000, 3)}`;
                break;
            case TIME_PRECISION.SECONDS.value:
            default:
        }
        
        return str + rest;
    }
}

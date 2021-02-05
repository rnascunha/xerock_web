import {App_Local_Template} from '../../../core/app/app_template.js';
import {Events} from './types.js';
import {App_List} from '../../app_list.js';
import {Message_Info} from '../../../core/types.js';
import {Control_Type, Message_Direction} from '../../../core/libs/message_factory.js';

const geo_opt = [
    {value: 'enableHighAccuracy', name: 'hi_acc'},
    {value: 'maximumAge', name: 'max_age'},
    {value: 'timeout', name: 'timeout'}
];

const geo_coords = [
    {value: 'accuracy', name: 'acc'},
    {value: 'altitude', name: 'alt'},
    {value: 'altitudeAccuracy', name: 'alt_acc'},
    {value: 'heading', name: 'head'},
//    {value: 'latitude', name: 'lat'},
//    {value: 'longitude', name: 'long'},
    {value: 'speed', name: 'speed'}
]

export class GeoLocation_Model extends App_Local_Template
{
    constructor(server)
    {
        super(App_List.GEOLOCATION.name, server, App_List.GEOLOCATION.long_name);
        
        this._watch = null;
    }
        
    static support(){ return 'geolocation' in navigator; }
    
    watching()
    {
        return this._watch !== null;
    }
        
    location(opt, watch = false)
    {
        if(this.watching()) return false;
        
        this.post_data(opt, this.server().id(), false);
        
        let geoSuccess = (position) => {
            this.post_data(position, this.server().id(), true);
        };
        let geoError = (error) => {
            this.emit(Events.ERROR, error.message);
        };
        
        if(watch){
            this._watch = navigator.geolocation.watchPosition(geoSuccess, geoError, opt);
            this.emit(Events.WATCH, this.watching());
            this.send_control(Control_Type.status.value, {watching: true});
        } else
            navigator.geolocation.getCurrentPosition(geoSuccess, geoError, opt);   
            
        return true;
    }
    
    clear_watch()
    {
        if(!this.watching()) return;
        
        navigator.geolocation.clearWatch(this._watch);
        this._watch = null;
        this.send_control(Control_Type.status.value, {watching: 'canceled'});
        this.emit(Events.WATCH, this.watching());
    }
    
    message_info(type_info, message, opt)
    {
        switch(type_info){
            case Message_Info.ID: 
            case Message_Info.FROM:
                return this.server().id();
            case Message_Info.ID_STRING:
            case Message_Info.FROM_STRING:
                return `${this.server().id()}`;
            case Message_Info.DATA_OUTPUT:
                return this._format_output(message);
        }
        return null;
    }
    
    _format_output(message)
    {
        let mdata = message.data;
        if(message.dir === Message_Direction.sent.value)
        {
            let data = 'options:';
            geo_opt.forEach(opt => {
               if(opt.value in mdata)
                   data += ` ${opt.name}=${mdata[opt.value]}`;
            });
            
            return [data];
        }

        let data = `${mdata.timestamp} [${mdata.coords.latitude}, ${mdata.coords.longitude}]`;
        geo_coords.forEach(opt => {
           if(mdata.coords[opt.value] !== null)
               data += ` ${opt.name}=${mdata.coords[opt.value]}`;
        });
        return [data];
    }
    
    _format_control_status(new_message, message)
    {
        new_message.data = [`watching: ${message.data.watching}`];
    }
}
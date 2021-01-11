import {App_Local_Template} from '../../../core/app/app_template.js';
import {Events} from './types.js';
import {App_List} from '../../app_list.js';
import {Message_Info} from '../../../core/types.js';
import {Message_Direction} from '../../../core/libs/message_factory.js';
import {Control_Type} from '../../../core/libs/message_factory.js';

const options = [
    {value: 'orientation', name: 'ori'},
    {value: 'motion', name: 'motion'},
];

const ori_opts = [
    {value: 'alpha', name: 'alpha'},
    {value: 'beta', name: 'beta'},
    {value: 'gamma', name: 'gamma'}
]

const motion_opts = [
    {value: 'acceleration', name: 'acc'},
    {value: 'accelerationIncludingGravity', name: 'acc_grav'},
    {value: 'rotationRate', name: 'rot'}
]

export class Orientation_Model extends App_Local_Template
{
    constructor()
    {
        super(App_List.ORIENTATION.name, App_List.ORIENTATION.long_name);
        
        this._watch = false;
        
        this._orientation = null;
        this._motion = null;
        
        this._pending = {
            ori: false, mot: false
        }
                
        this._motion_handler = null;
        this._orientation_handler = null;        
    }
    
    install_listeners()
    {
        if('DeviceMotionEvent' in window)
        {
            this._motion_handler = this._motion_data.bind(this);
            window.addEventListener('devicemotion', this._motion_handler, false);
        }
        
        if('DeviceOrientationEvent' in window)
        {
            this._orientation_handler = this._orientation_data.bind(this);
            window.addEventListener('deviceorientation', this._orientation_handler, false);
        }        
    }
    
    uninstall_listeners()
    {
        if(this._motion_handler)
            window.removeEventListener('devicemotion', this._motion_handler);
        
        if(this._orientation_handler)
              window.removeEventListener('deviceorientation', this._orientation_handler);
        
        this._orientation_handler = null;
        this._motion_handler = null;
        
        this.clear_watch();
    }
    
    installed()
    {
        return !(this._orientation_handler === null && this._motion_handler === null);
    }
        
    _orientation_data(ev)
    {
        this._orientation = {
          euler: {
              alpha: ev.alpha,
              beta: ev.beta,
              gamma: ev.gamma
          }
        }
    }
    
    _motion_data(ev)
    {
        this._motion = {
            acceleration: {
                x: ev.acceleration.x,
                y: ev.acceleration.y,
                z: ev.acceleration.z
            },
            accelerationIncludingGravity: {
                x: ev.accelerationIncludingGravity.x,
                y: ev.accelerationIncludingGravity.y,
                z: ev.accelerationIncludingGravity.z
            },
            rotationRate: {
                alpha: ev.rotationRate.alpha,
                beta: ev.rotationRate.beta,
                gamma: ev.rotationRate.gamma
            }
        };
    }
        
    support(){ return this.support_orientation() || this.support_motion(); }
    
    support_orientation()
    {
        return 'DeviceOrientationEvent' in window;
    }
    
    support_motion()
    {
        return 'DeviceMotionEvent' in window;
    }
                  
    watching()
    {
        return this._watch !== false;
    }
        
    orientation(opts, watch = false)
    {
        if(this.watching()) return false;
        
        this.post_data(opts, this.server().id(), false);
        
        if(watch)
        {
            this._watch = {status: 'install', opts: opts, interval: watch};
            this.emit(Events.WATCH, this._watch);
            this.send_control(Control_Type.status.value, this._watch);
            this._watch.handler = setInterval(() => this._post_data(this._watch.opts), this._watch.interval);
        }
        
        this._post_data(opts);
            
        return true;
    }
    
    _post_data(opts)
    {
        let data = {};
        if(opts.orientation && this._orientation)
            data.orientation = this._orientation;
            
        if(opts.motion && this._motion)
            data.motion = this._motion;
        
        this.post_data(data, this.server().id());
    }
    
    clear_watch()
    {
        if(!this.watching()) return;
        
        clearInterval(this._watch.handler);
        this._watch = false;
        this.send_control(Control_Type.status.value, {status: 'canceled'});
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
            options.forEach(opt => {
               if(opt.value in mdata)
                   data += ` ${opt.name}=${mdata[opt.value]}`;
            });
            
            return [data];
        }
        
        let data = [];
        if('motion' in mdata)
        {
            let mmdata = mdata.motion;
            let str = 'motion:';
            if('acceleration' in mmdata)
            {
                let mmmdata = mmdata.acceleration;
                if(mmmdata.x || mmmdata.y || mmmdata.z)
                    str += ` acc=${mmmdata.x ? mmmdata.x : ''},${mmmdata.y ? mmmdata.y : ''},${mmmdata.z ? mmmdata.z : ''}`;
            }
            if('accelerationIncludingGravity' in mmdata)
            {
                let mmmdata = mmdata.accelerationIncludingGravity;
                if(mmmdata.x || mmmdata.y || mmmdata.z)
                    str += ` acc_grav=${mmmdata.x ? mmmdata.x : ''},${mmmdata.y ? mmmdata.y : ''},${mmmdata.z ? mmmdata.z : ''}`;
            }
            if('rotationRate' in mmdata)
            {
                let mmmdata = mmdata.rotationRate;
                if(mmmdata.alpha || mmmdata.beta || mmmdata.gamma)
                    str += ` rot=${mmmdata.alpha ? mmmdata.alpha : ''},${mmmdata.beta ? mmmdata.beta : ''},${mmmdata.gamma ? mmmdata.gamma : ''}`;
            }
            data.push(str);
        }
        
        if('orientation' in mdata)
        {
            let mmdata = mdata.orientation;
            let str = 'ori:';
            if('euler' in mmdata)
            {
                let mmmdata = mmdata.euler;
                if(mmmdata.alpha || mmmdata.beta || mmmdata.gamma)
                    str += ` euler=${mmmdata.alpha ? mmmdata.alpha : ''},${mmmdata.beta ? mmmdata.beta : ''},${mmmdata.gamma ? mmmdata.gamma : ''}`;
            }
            data.push(str);
        }
        
        return data;
    }
    
    _format_control_status(new_message, message)
    {
        if(message.data.status === 'install'){
            let w;
            if(message.data.opts.orientation && message.data.opts.motion)
                w = 'orientation,motion';
            else if(message.data.opts.orientation) w = 'orientation';
            else w = 'motion';
            new_message.data = [`watching: [${w}] / interval: ${message.data.interval}ms`];
        } else  new_message.data = ['watching: cancelled'];
    }
}
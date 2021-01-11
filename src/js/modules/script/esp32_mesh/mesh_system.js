import {Mesh_Info} from './types.js';
import {copy} from '../../../helper/object_op.js';

const max_rssi_data = 20;

function find_tree_mac(mac, device)
{
    if(device.mac() == mac) return device;

    let dev = null;
    device.children().some(child => {
        dev = find_tree_mac(mac, child);
        if(dev) return true;
    });

    return dev;
}

function get_tree_devices(root, devices = [])
{
    devices.push(root);
    
    root.children().forEach(child => {
       get_tree_devices(child, devices);
    });
    
    return devices;
}

export class Mesh_System
{
    constructor()
    {
        this._wifi_router_list = new Wifi_Router_List();
        this._net_list = new Mesh_Net_List();
        this._device_list = new Mesh_Device_List();
    }
    
    add(data, from)
    {
        //Adding device
        let dev = this.add_device(data[Mesh_Info.ADDR], data);
        
        //Adding network
        let net = null;
        if(data[Mesh_Info.MESH_ID])
            net = this.add_net(data[Mesh_Info.MESH_ID], this.device());
         
        //Getting network (if necessary)
        if(!net && dev.id())
            net = this.net(dev.id());

        if(!net) return;
                        
        //Adding border router
        let br = null;
        if(dev.layer()){
            if(dev.layer() == 1)
                br = net.add_border_router(dev, from.addr, from.port);
            else
                net.remove_border_router(dev);
        }
        
        //Adding wifi router
        if(br && dev.parent())
        {
            let router = this.add_wifi_router(dev.parent());
            router.add_child(br.device());
            br.router(router);
        }
        
        //Check unconnected devices
        net.unconnected(true);
    }
    
    net(net = null)
    {
        if(net === null) return this._net_list.list();
        return this._net_list.get(net);
    }
        
    add_net(id, br, dev_list = null)
    {
        return this._net_list.add(id, br, dev_list);
    }
    
    br_by_mac(mac)
    {
        return this._net_list.br_by_mac(mac);
    }
    
    check_border_router(addr_list)
    {
        this._net_list.check_border_router(addr_list);
    }
    
    device(mac = null)
    {
        if(mac === null) return this._device_list.list();
        return this._device_list.get(mac);
    }
    
    add_device(mac, opt = null)
    {
        return this._device_list.add(mac, opt);
    }
    
    wifi_router(mac = null)
    {
        if(mac === null) return this._wifi_router_list.list();
        return this._wifi_router_list.get(mac);
    }
    
    add_wifi_router(router)
    {
        return this._wifi_router_list.add(router);
    }
    
    unconnected_devices()
    {
        let unconnected = [];
        this.device().forEach(dev => {
            this.wifi_router().forEach(router => {
               let fdev = find_tree_mac(dev.mac(), router); 
                if(!fdev) {
                    //At reconnection, the bad border router may still be up... so we need to filter
                    if(!unconnected.find(d => d.mac() == dev.mac()))
                        unconnected.push(dev);
                }
            });
        });
        
        return unconnected;
    }
}

export class Wifi_Router_List
{
    constructor()
    {
        this._list = {};
    }
    
    list()
    {
        return Object.values(this._list);
    }
    
    get(mac)
    {
        return this._list[mac];
    }
    
    add(dev_router)
    {
        let mac = dev_router instanceof Wifi_Router ? dev_router.mac() : dev_router;
        let router = this.get(mac);
        if(!router){
            router = new Wifi_Router(mac);
            this._list[mac] = router;
        }
            
        return router;
    }
    
    remove(mac)
    {
        delete this._list[mac];
    }
}

export class Wifi_Router
{
    constructor(mac, children = {})
    {
        this._mac = mac;
        this._name = '';
        this._children = children;
    }
    
    mac(mac = null)
    {
        if(mac !== null) this._mac = mac;
        return this._mac;
    }
    
    name(name = null)
    {
        if(name !== null) this._name = name;
        return this._name;
    }
    
    full_name()
    {
        if(this.name()) return `${this.name()} (${this.mac()})`;
        return this.mac();
    }
        
    add_child(child)
    {
        console.assert(child instanceof Mesh_Device, 'Child must be "Mesh_Device" type');
        
        this._children[child.mac()] = child;
        child.parent(this);
    }
    
    remove_child(child)
    {
        console.assert(child instanceof Mesh_Device, 'Child must be "Mesh_Device" type');
        
        delete this._children[child.mac()];
    }
    
    children(children = null)
    {
        if(children != null) this._children = children;
        return Object.values(this._children);
    }
}

export class Mesh_Net_List{
    constructor()
    {
        this._list = {};
    }
    
    list()
    {
        return Object.values(this._list);
    }
    
    get(net)
    {
        return this._list[net];
    }
    
    add(id, dev_list = null)
    {
        let n_id = this._list[id];
        if(!n_id){
            n_id = new Mesh_Net(id);
            this._list[id] = n_id;
        }
        
        if(dev_list){
            n_id.add(dev_list);
        }
        
        return n_id;
    }
    
    check_border_router(addr_list)
    {
        Object.keys(this._list).forEach(net => this._list[net].check_border_router(addr_list));
    }

    br_by_mac(mac)
    {
        let n_br = null;
        this.list().forEach(net => {
            net.border_router().forEach(br => {
                let dev  = find_tree_mac(mac, br.device());
                if(dev)
                {
                    n_br = br;
                    return;
                }                            
            });
            if(n_br) return;
        });
        
        return n_br;
    }
}

export class BR_Device{
    constructor(ip, port, dev = null)
    {
        this._ip = ip;
        this._port = port;
        this._device = dev;
        this._router = null;        
    }
    
    device(dev = null)
    {
        if(dev !== null) this._device = dev;
        return this._device;
    }
    
    router(rt = null)
    {
        if(rt !== null) this._router = rt;
        return this._router;
    }
    
    ip()
    {
        return this._ip;    
    }
    
    port()
    {
        return this._port;
    }
    
    to()
    {
        return {addr: this._ip, port: this._port};
    }
    
    is_same(ip_or_dev, port)
    {
        if(ip_or_dev instanceof Mesh_Device)
            return ip_or_dev.mac()== this._device.mac();
        
        return ip_or_dev == this._ip && port == this._port;
    }
}

export class Mesh_Net
{
    constructor(id)
    {
        this._id = id;
        this._devices = {};
        this._name = '';
        this._brs = [];
        
        this._unconnected = [];
    }
    
    name(name = null)
    {
        if(name !== null) this._name = name;
        return this._name;
    }
    
    id(id_ = null)
    {
        if(id_ !== null) this._id = id_;
        return this._id;
    }
    
    full_name()
    {
        if(name) return `${this.name()} (${this.id()})`;
        return this.id()
    }
    
    devices()
    {
        return Object.values(this._devices); 
     }
    
    add_border_router(dev, ip, port)
    {
        let n_br = this._brs.find(b => b.is_same(ip, port));
        if(!n_br) {
            n_br = new BR_Device(ip, port, dev);
            this._brs.push(n_br);    
        }
                
        return n_br;
    }
    
    remove_border_router(device)
    {
        let d_br = this._brs.find(br => br.device().mac() == device.mac())
        if(d_br)
        {
            if(d_br.router())
                d_br.router().remove_child(device);
            this._brs = this._brs.filter(br => br.device().mac() != device.mac());
        }        
    }
    
    border_router()
    {
        return this._brs;
    }
    
    check_border_router(addr_list)
    {
        let new_brs = [];

        this._brs.forEach(br => {
            let finded = addr_list.find(addr => br.is_same(addr.addr(), addr.port()));
            if(finded) 
                new_brs.push(br);
            else if(br.router())
                br.router().remove_child(br.device());
        });        

        this._brs = new_brs;
        //Check unconnected devices
        this.unconnected(true);
    }

    number_devices()
    {
        return Object.keys(this._devices).length;
    }
    
    last_layer()
    {
        let layer = 0;
        Object.values(this._devices).forEach(dev => layer = dev.layer() > layer ? 
                                                            dev.layer() : layer);
        
        return layer;
    }
        
    add(dev_list)
    {
        this._devices = {};
        dev_list.forEach(dev => {
           if(dev.id() == this.id())
               this._devices[dev.mac()] = dev;
        });        
    }
    
    device_by_mac(mac)
    {
        return Object.values(this._devices).find(dev => dev.mac() == mac);
    }
    
    device_by_mac_ap(mac_ap)
    {
        return Object.values(this._devices).find(dev => dev.mac_ap() !== null && dev.mac_ap() == mac_ap);
    }
    
    unconnected(update = false)
    {
        if(update) this._unconnected = this.unconnected_devices();
        return this._unconnected;
    }
    
    unconnected_devices()
    {
        let dev_tree_list = [];
        this.border_router().forEach(br => {
            if(br.router()) 
                get_tree_devices(br.router(), dev_tree_list);
        });
        
        let unconnected = [];
        this.devices().forEach(dev => {
           let d = dev_tree_list.find(dl => dl.mac() == dev.mac());
            if(!d) unconnected.push(dev);
        });
        
        return unconnected;
    }
}

export class Mesh_Device_List{
    constructor()
    {
        this._list = {};
    }
    
    list()
    {
        return Object.values(this._list)
    }
    
    add(mac, data = null, set_updated = true)
    {
        let dev = this._list[mac];
        if(!dev)
        {
            dev = new Mesh_Device(mac);
            this._list[mac] = dev;
        }

        if(data)
        {
            if(data.hasOwnProperty(Mesh_Info.NODE_VERSION))
                dev.version(data[Mesh_Info.NODE_VERSION]);
            if(data.hasOwnProperty(Mesh_Info.LAYER))
                dev.layer(data[Mesh_Info.LAYER]);
            if(data.hasOwnProperty(Mesh_Info.MESH_ID))
                dev.id(data[Mesh_Info.MESH_ID]);
            if(data.hasOwnProperty(Mesh_Info.IS_ROOT))
                dev.is_root(data[Mesh_Info.IS_ROOT] > 0 ? true : false);
            if(data.hasOwnProperty(Mesh_Info.MAC_AP))
                dev.mac_ap(data[Mesh_Info.MAC_AP]);
            if(data.hasOwnProperty(Mesh_Info.CH_CONFIG))
                dev.ch_config(data[Mesh_Info.CH_CONFIG]);
            if(data.hasOwnProperty(Mesh_Info.CH_CONN))
                dev.ch_conn(data[Mesh_Info.CH_CONN]);
            if(data.hasOwnProperty(Mesh_Info.PARENT))
                this._update_parent(dev, data[Mesh_Info.PARENT]);
            if(data.hasOwnProperty(Mesh_Info.RSSI))
                dev.rssi(data[Mesh_Info.RSSI]);
            if(data.hasOwnProperty(Mesh_Info.CHILDREN))
                this._update_children(dev, data[Mesh_Info.CHILDREN]);
        }
        
        if(set_updated) dev.updated(Date.now());
        return dev;
    }
    
    get(mac)
    {
        return this._list[mac];
    }
    
    device_by_mac_ap(mac_ap)
    {
        return this.list().find(dev => dev.mac_ap() == mac_ap);
    }
    
    _update_parent(device, new_parent_mac_ap)
    {
        let old_parent = device.parent();
                
        if(old_parent){
            if(old_parent instanceof Mesh_Device){
                if(old_parent.mac_ap() == new_parent_mac_ap){ 
                    old_parent.add_child(device);
                    return;
                } else
                    old_parent.remove_child(device);
            } else if(old_parent instanceof Wifi_Router){
                if(old_parent.mac() != new_parent_mac_ap){
                    old_parent.remove_child(device);
                } else
                    return;
            }
        }
    
        let n_parent = this.device_by_mac_ap(new_parent_mac_ap);
        if(n_parent)
        {
            n_parent.add_child(device);
            device.parent(n_parent);
        } else {
            device.parent(new_parent_mac_ap);
        }
    }
    
    _update_children(device, new_children)
    {
        device.children_table({});
        new_children.forEach(child => {
            if(child != device.mac())
            {
                let opt = {};
                opt[Mesh_Info.IS_ROOT] = false;
                if(device.id()) opt[Mesh_Info.MESH_ID] = device.id();
                let new_child = this.add(child, opt, false),
                    new_parent = new_child.parent();
                
                device.add_children_table(new_child);
                
                if(!new_parent){
                    new_child.parent(device);
                    device.add_child(new_child);
                }
                else if(typeof new_parent === 'string')
                    this._update_parent(new_child, new_parent);
            }
        });
        
        device.children().forEach(child =>{
           let c = new_children.find(new_child => new_child == child.mac());
            if(!c) device.remove_child(child);
        });
    }
}

export class Mesh_Device{
    constructor(mac, parent = null, children = [])
    {
        this._mac = mac;
        this._mac_ap = null;
        this._parent = parent;
        this._children = children;
        this._layer = null;
        this._rssi_parent = null;
        this._is_root = null;
        this._name = '';
        this._net_id = null;
        this._version = null;
        this._ch_config = null;
        this._ch_conn = null;
        
        this._children_table = {};
        
        this._n_rssi_parent = {};
        
        this._updated = 0;
        this._sended = 0;
    }
        
    version(ver = null)
    {
        if(ver != null) this._version = ver;
        return this._version;
    }
    
    id(id = null)
    {
        if(id) this._net_id = id;
        return this._net_id;
    }
    
    name(name = null)
    {
        if(name !== null) this._name = name;
        return this._name;
    }
    
    mac()
    {
        return this._mac;
    }
    
    mac_ap(mac = null)
    {
        if(mac !== null) this._mac_ap = mac;
        return this._mac_ap;
    }
    
    layer(layer = null)
    {
        if(layer !== null) this._layer = layer;
        return this._layer;
    }
    
    is_root(is = null)
    {
        if(is !== null) this._is_root = is;
        return this._is_root;
    }
    
    parent(parent = null)
    {
        if(parent) this._parent = parent;
        return this._parent;
    }
    
    parent_string()
    {
        if(this._parent instanceof Mesh_Device || 
           this._parent instanceof Wifi_Router) 
            return this._parent.mac();
        return this._parent;
    }
    
    children()
    {
        return this._children;
    }
    
    add_child(child)
    {
        let n_child = this._children.find(dev => dev.mac() == child.mac());
        if(!n_child) this._children.push(child);
    }
    
    remove_child(child)
    {
        this._children = this._children.filter(dev => dev.mac() != child.mac());
    }
    
    children_table(table = null)
    {
        if(table !== null) this._children_table = table;
        
        return Object.values(this._children_table);
    }
    
    add_children_table(child)
    {
        console.assert(child instanceof Mesh_Device, "'child' must be of type 'Mesh_Device'");
        this._children_table[child.mac()] = child;
    }
    
    remove_children_table(child)
    {
        console.assert(child instanceof Mesh_Device, "'child' must be of type 'Mesh_Device'");
        delete this._children_table[child.mac()];
    }
    
    rssi(rssi = null)
    {
        if(rssi !== null){
            if(this.parent())
            {
                let parent_mac = this.parent_string();
                if(!this._n_rssi_parent.hasOwnProperty(parent_mac))
                    this._n_rssi_parent[parent_mac] = [{rssi: rssi, time: new Date()}]
                else{
                    this._n_rssi_parent[parent_mac].push({rssi: rssi, time: new Date()});
                    this._n_rssi_parent[parent_mac] = this._n_rssi_parent[parent_mac].slice(-max_rssi_data);
                }
            }
            if(this._rssi_parent){
                this._rssi_parent.push(rssi);
                this._rssi_parent = this._rssi_parent.slice(-max_rssi_data);
            } else this._rssi_parent = [rssi];
        }
        return this._rssi_parent ? this._rssi_parent[this._rssi_parent.length - 1] : this._rssi_parent;
    }
    
    rssi_arr()
    {
        return this._rssi_parent;
    }
    
    rssi_object()
    {
        return this._n_rssi_parent;
    }
    
    ch_config(ch = null)
    {
        if(ch !== null) this._ch_config = ch;
        return this._ch_config;
    }
    
    ch_conn(ch = null)
    {
        if(ch !== null) this._ch_conn = ch;
        return this._ch_conn;
    }
        
    data_is_incomplete()
    {
        return this.version() === null || this.id() === null || this.mac_ap() === null || this.rssi() === null ||
                this.layer() === null || this.parent() === null;
    }
        
    updated(up = null)
    {
        if(up !== null) this._updated = up;
        return this._updated;
    }
    
    sended(send = null)
    {
        if(send !== null) this._sended = send;
        return this._sended;
    }
}
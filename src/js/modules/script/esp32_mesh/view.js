import {Event_Emitter} from '../../../libs/event_emitter.js';
import {ESP32_Events, Mesh_Info} from './types.js';
import {BR_Command_Type, 
        Node_Message_Type, 
        Node_Command_Type} from '../../../components/esp32_br_input/type.js';
import {Node_Command_Type_Response} from './types.js';
import {get_selected} from '../../../helper/helpers_basic.js';
import {Date_Time_Format} from '../../../time_format.js';
import {app} from '../../../main.js';
import {Mesh_System, Wifi_Router, Mesh_Net} from './mesh_system.js';
import * as d3 from 'd3';
import * as Graph from './draw_graph.js';

import style from '../libs/script_config.css';
import script_style from './esp32_mesh_script.css';

export class ESP32_Mesh_Script_View extends Event_Emitter
{
    constructor(model)
    {
        super();
        
        this._el = this._create_element();
        this._modal = null;
        
        this._model = model;
        this._model.on(ESP32_Events.RENDER_DEVICES, arg => this.render_devices(arg))
                    .on(ESP32_Events.RENDER_NET, arg => this.render_net(arg))
                    .on(ESP32_Events.RENDER_MESSAGES, arg => this.render_messages(arg.data, arg.from, arg.input, arg.message))
                    .on(ESP32_Events.RENDER_BR_CLIENTS, () => this.render_br_clients())
                    .on(ESP32_Events.ENABLE, en => this.enable(en))
                    .on(ESP32_Events.ERROR, arg => this.error(arg))
                    .on(ESP32_Events.RENDER_ROUTERS, () => this.render_router());
    }
    
    enable(en)
    {
        this._el.querySelector('#esp32-mesh-id').disabled = Boolean(en);
        this._el.querySelector('#esp32-mesh-compare-type').disabled = Boolean(en);
        this._el.querySelector('#esp32-mesh-open-window').disabled = Boolean(!en);
        if(!en) this._modal.outerHTML = '';
        else this._create_modal();
    }
    
    element()
    {
        return this._el;
    }
    
    render_devices()
    {
        let tbody = this._modal.querySelector('#esp32-mesh-device-body');
        tbody.innerHTML = '';
        this._model._system.device().forEach(dev => {
            let line = document.createElement('tr');
            line.innerHTML = `<td class=esp32-mesh-mac-device>${dev.mac()}</td>
                                <td>${dev.name()}</td>
                                <td>${dev.layer()}</td>
                                <td>${dev.parent_string()}</td>
                                <td>${dev.id()}</td>
                                <td>${dev.version()}</td>
                                <td>${dev.ch_config()}</td>
                                <td>${dev.ch_conn()}</td>
                                <td>${dev.rssi()}</td>
                                <td>${dev.mac_ap()}</td>
                                <td>${dev.is_root()}</td>`;
            
            let col = document.createElement('td');
            Object.keys(Node_Command_Type).forEach(comm => {
                let button = document.createElement('button');
                button.textContent = comm.slice(0,2);
                button.onclick = ev => {
                    this._model._send_node_command(dev.mac(), 
                                            Node_Command_Type[comm], 
                                            dev.version() !== null ? dev.version() : 0);
                }
                button.title = comm;
                col.appendChild(button);
            });
            line.appendChild(col);
            tbody.appendChild(line);
        });
        
        tbody.querySelectorAll('.esp32-mesh-mac-device').forEach(mac_el => {
            mac_el.onclick = ev => {
                this._modal.querySelector('#esp32-mesh-comm-input').mac(mac_el.textContent);
            }
        });
    }
    
    render_net()
    {
        function create_line(data, span)
        {
            let col = document.createElement('td');
            col.rowSpan = span;
            col.textContent = data;
            
            return col;
        }
        
        let tbody = this._modal.querySelector('#esp32-mesh-net-list-body');
        tbody.innerHTML = '';
        this._model._system.net().forEach(net => {
            let line = document.createElement('tr'),
                n_roots = net.border_router().length;
        
            line.appendChild(create_line(net.id(), n_roots));
            line.appendChild(create_line(net.name(), n_roots));
            line.appendChild(create_line(net.number_devices(), n_roots));
            line.appendChild(create_line(net.last_layer(), n_roots));
            
            net.border_router().forEach((br, idx) => {
                let n_line = idx == 0 ? line : document.createElement('tr');
                
                let col = document.createElement('td');
                col.textContent = `${br.ip()}:${br.port()}`;
                n_line.appendChild(col);
                
                let dev_col = document.createElement('td');
                dev_col.textContent = br.device() ? br.device().mac() : null;
                n_line.appendChild(dev_col);
                
                let ncol = document.createElement('td');
                Object.keys(BR_Command_Type).forEach(comm => {
                   let button = document.createElement('button');
                    button.textContent = comm.slice(0,2);
                    button.onclick = ev => {
                        this._model._send_br_command(br.to(), BR_Command_Type[comm]);
                    }
                    button.title = comm;
                    ncol.appendChild(button);
                });
                n_line.appendChild(ncol);
                tbody.appendChild(n_line);
            });
        });
        
        let tab = this._modal.querySelector('#esp32-mesh-content-tabs');
        this._model._system.net().forEach(net => {
            let has_tab = false;
            tab.querySelectorAll('.esp32-mesh-net-tab').forEach(n => {
                if(n.dataset.net == net.id()) { has_tab = true; return; }
            });
            if(!has_tab){
                let button = document.createElement('button');
                button.setAttribute('slot', 'title');
                button.setAttribute('class', 'esp32-mesh-net-tab');
                button.textContent = net.id();
                tab.appendChild(button);

                let section = document.createElement('section');
                section.setAttribute('class', 'esp32-mesh-content-panel esp32-mesh-net-tab esp32-mesh-net-tab-content');
                section.setAttribute('data-net', '' + net.id());
                tab.appendChild(section);
            }
        });
        tab.reprocess();
        
        this._draw_net();
    }
    
    render_messages(data, from, input, message)
    {
        let parsed = data.data,
            line = document.createElement('tr'),
            data_field = this._format_data_field(data.data);
        
        line.innerHTML = `<td>${Date_Time_Format.format(message.time, 
                                                            app.configure().time_format, 
                                                            app.configure().time_precision)}</td>
                            <td>>></td>
                            <td>${parsed[Mesh_Info.BR_VERSION]}</td>
                            <td>${parsed[Mesh_Info.ADDR]}</td>
                            <td>${parsed[Mesh_Info.BR_SIZE]}</td>
                            <td>${parsed[Mesh_Info.NODE_VERSION]}</td>
                            <td>${parsed.message_type_name}</td>
                            <td>${parsed[Mesh_Info.NODE_SIZE]}</td>
                            <td>${data_field}</td>`;
        
        this._modal.querySelector('#esp32-mesh-messages-body').appendChild(line);
        let check_scroll = this._modal.querySelector('#esp32-mesh-auto-scroll-messages');
        if(check_scroll.checked)
        {
            let div = this._modal.querySelector('#esp32-mesh-table-messages-container');
            div.scrollTop = div.scrollHeight;
        }
    }
    
    render_br_clients()
    {
        let sel = this._modal.querySelector('#esp32-mesh-comm-clients-select'),
            selected = get_selected(sel);
        
        sel.innerHTML = '';
        this._model._br_clients.forEach(client => {
            let op = document.createElement('option');
            op.value = JSON.stringify({addr: client.addr(), port: client.port()});
            op.textContent = `${client.addr()}:${client.port()}`;
            if(selected && selected.value == op.value) op.selected = true;
            
            sel.appendChild(op);
        });
        
        let dis = this._model._br_clients.length == 0;
        this._modal.querySelectorAll('.esp32-mesh-comm-br-raw-op').forEach(comm => {
            comm.disabled = dis;
        });
    }
    
    render_router()
    {
        let tbody = this._modal.querySelector('#esp32-mesh-router-table-tbody');
        
        tbody.innerHTML = '';
        this._model._system.wifi_router().forEach(router => {
           tbody.innerHTML += `<tr><td>${router.mac()}</td><td>${router.name()}</td></tr>`; 
        });
    }
    
    error(message_err = '')
    {
        this._modal.querySelector('#esp32-mesh-comm-error').textContent = message_err;
    }
    
    _draw_net()
    {
        this._modal.querySelectorAll('.esp32-mesh-net-tab-content').forEach(net_tab => {
            let net = this._model._system.net(net_tab.dataset.net);
            if(net)
            {
                this._draw_tree_net(net, net_tab);        
                this._draw_devices_net(net, net_tab);
            } else {
                net_tab.textContent = `Mesh net ${net_tab.dataset.net} not found`;
            }
        });
    }
    
    _draw_tree_net(net, net_tab)
    {
        let container = net_tab.querySelector('.esp32-mesh-net-tree-content');
        if(!container)
        {
            container = document.createElement('div');
            container.setAttribute('class', 'esp32-mesh-net-tree-content');
            net_tab.appendChild(container);
        }
        container.innerHTML = '';
        let routers_used = [];
        net.border_router().forEach(br => {
            let root = br.router() ? br.router() : br.device(),
                flag = true;
            if(root instanceof Wifi_Router)
            {
                let finded = routers_used.find(router => router.mac() == root.mac());
                if(!finded) routers_used.push(root);
                else flag = false;
            }
            
            if(flag){
                let tree_data = d3.hierarchy(root, 
                                             dev => dev.children().length ? dev.children() : undefined);

                container.appendChild(Graph.draw_tree(net_tab, tree_data, net));
            }
        });
    }
    
    _draw_devices_net(net, net_tab)
    {
        let content_dev = net_tab.querySelector('.esp32-mesh-net-dev-content');
        if(!content_dev){
            content_dev = document.createElement('div');
            content_dev.setAttribute('class', 'esp32-mesh-net-dev-content');
            
            let list_dev = document.createElement('div');
            list_dev.setAttribute('class', 'esp32-mesh-net-dev-list');
            content_dev.appendChild(list_dev);
            
            let info_dev = document.createElement('div');
            info_dev.setAttribute('class', 'esp32-mesh-net-dev-info');
            content_dev.appendChild(info_dev);
            
            net_tab.appendChild(content_dev);
        }
        
        let list_dev = content_dev.querySelector('.esp32-mesh-net-dev-list'),
            info_dev = content_dev.querySelector('.esp32-mesh-net-dev-info');
        const id_prefix = 'esp32-mesh-dev-net-';
        net.devices().forEach((dev,i) => {
            let dev_name = dev.mac().replace(/:/g, ''),
                menu = content_dev.querySelector('#' + id_prefix + dev_name);
            
            if(!menu)
            {
                menu = document.createElement('div');
                menu.setAttribute('id', id_prefix + dev_name);
                menu.setAttribute('class', 'esp32-mesh-dev-net-title');
                
                let title_text = document.createElement('span');
                title_text.textContent = dev.mac();
                menu.appendChild(title_text);

                let title_cmd = document.createElement('span');
                Object.keys(Node_Command_Type).forEach(comm => {
                    let button = document.createElement('button');
                    button.textContent = comm.slice(0,2);
                    button.addEventListener('click', ev => {
                        this._model._send_node_command(dev.mac(), 
                                                Node_Command_Type[comm], 
                                                dev.version() !== null ? dev.version() : 0);
//                        ev.stopPropagation();
                    }, false);
                    button.title = comm;
                    title_cmd.appendChild(button);
                });
                
                menu.onclick = ev => {
                    list_dev.querySelectorAll('.esp32-mesh-dev-net-title').forEach(t => {
                        t.classList.remove('esp32-mesh-dev-net-title-selected');
                    })
                    
                    menu.classList.add('esp32-mesh-dev-net-title-selected');
                    if(info_dev.dataset.dev != dev.mac())
                        _make_info_dev(dev, info_dev);
                    this._update_dev_net_data(info_dev, dev);
                }
                
                this._update_dev_net_data(info_dev, dev);
                menu.appendChild(title_cmd);
                list_dev.appendChild(menu);
            }
                        
            function _make_info_dev(dev, container)
            {
                container.innerHTML = '';
                container.dataset.dev = dev.mac();
                
                let content = document.createElement('div');
                content.setAttribute('class', 'esp32-mesh-dev-info');
                ['Version', 'Name',	'Layer', 'Parent', 'Channel', 'RSSI', 'MAC_AP', 'Is_root', 'Children', 'Children_Table'].forEach(h => {
                    let content_line = document.createElement('div');
                    content_line.setAttribute('class', 'esp32-mesh-dev-info-line');

                    let head = document.createElement('span');
                    head.setAttribute('class', 'esp32-mesh-dev-info-head');
                    head.textContent = h;
                    content_line.appendChild(head);

                    let info = document.createElement('span');
                    info.setAttribute('class', `esp32-mesh-dev-info-content esp32-mesh-dev-info-content-${h}`);
                    if(h == 'Channel') info.title = 'Configure/Connected';

                    content_line.appendChild(info);

                    content.appendChild(content_line);
                });
                container.appendChild(content);
                
            }
            
            if(net.unconnected().find(ud => ud.mac() == dev.mac())){
                menu.classList.add('esp32-mesh-dev-net-title-unconnected');
            } else {
                menu.classList.remove('esp32-mesh-dev-net-title-unconnected');
            }
                                                        
            this._update_dev_net_data(info_dev, dev);
        });
    }
    
    _update_dev_net_data(net_tab, dev)
    {
        if(!net_tab) return;
        if(net_tab.dataset.dev != dev.mac()) return;

        net_tab.querySelector('.esp32-mesh-dev-info-content-Version').textContent = dev.version();
        net_tab.querySelector('.esp32-mesh-dev-info-content-Name').textContent = dev.name();
        net_tab.querySelector('.esp32-mesh-dev-info-content-Layer').textContent = dev.layer();
        net_tab.querySelector('.esp32-mesh-dev-info-content-Parent').textContent = dev.parent_string();
        net_tab.querySelector('.esp32-mesh-dev-info-content-Channel').textContent = `${dev.ch_config()}/${dev.ch_conn()}`;
        net_tab.querySelector('.esp32-mesh-dev-info-content-MAC_AP').textContent = dev.mac_ap();
        net_tab.querySelector('.esp32-mesh-dev-info-content-Is_root').textContent = dev.is_root();
        net_tab.querySelector('.esp32-mesh-dev-info-content-RSSI').textContent = dev.rssi_arr() ? 
                                                                                    dev.rssi_arr().slice(-5) : 
                                                                                    dev.rssi_arr();
        net_tab.querySelector('.esp32-mesh-dev-info-content-RSSI').title = dev.rssi_arr();

        net_tab.querySelector('.esp32-mesh-dev-info-content-Children').textContent = 
                                dev.children().reduce((acc, d, i) => {
                                    let temp = acc + d.mac();
                                    if(i != dev.children().length - 1) temp += ', ';
                                    return temp;
                                }, '');
        
        net_tab.querySelector('.esp32-mesh-dev-info-content-Children_Table').textContent = 
                        dev.children_table()
                            .reduce((acc, d, i) => {
                                    let temp = acc + d.mac();
                                    if(i != dev.children_table().length - 1) temp += ', ';
                                    return temp;
                                }, '');
        
        if(!dev.rssi_arr() || !dev.rssi_arr().length) return;
//        let graph = net_tab.querySelector('svg');
        let graph = net_tab.querySelector('#' + 'esp32-rssi-graph' + dev.mac().replace(/:/g, ''));
        if(!graph)
            net_tab.appendChild(Graph.draw_rssi_graph(dev));

        Graph.update_rssi_graph(dev, graph);  
        
        this._make_parent_rssi_graph(net_tab, dev);
    }
    
    _make_parent_rssi_graph(container, dev)
    {
        let rssi_container = container.querySelector('.esp32-mesh-dev-rssi-parent-select');
        if(!rssi_container)
        {
            rssi_container = document.createElement('my-tabs');
            rssi_container.setAttribute('class', 'esp32-mesh-dev-rssi-parent-select');
            container.appendChild(rssi_container);            
        }
        
        Object.keys(dev.rssi_object()).forEach((parent, idx) => {
            if(dev.rssi_object()[parent] && dev.rssi_object()[parent].length > 0)
            {
                let parent_name = parent.replace(/:/g, ''),
                    mac = dev.mac().replace(/:/g, '');

                let parent_container = rssi_container.querySelector('#esp32-mesh-dev-parent-rssi-info' + parent_name + '-' + mac);
                if(!parent_container){
                    let button = document.createElement('button');
                    button.textContent = parent;
                    button.setAttribute('slot', 'title');
                    button.setAttribute('class', 'esp32-mesh-dev-rssi-parent-title');

                    rssi_container.appendChild(button);

                    parent_container = document.createElement('section');
                    parent_container.setAttribute('data-parent', parent);
                    parent_container.setAttribute('id', 'esp32-mesh-dev-parent-rssi-info' + parent_name + '-' + mac);

                    rssi_container.appendChild(parent_container);

                     if(parent == dev.parent_string()) rssi_container.selected = idx;

                    parent_container.appendChild(Graph.draw_rssi_parent_graph(dev, parent));
                }
                
                Graph.update_rssi_parent_graph(dev, parent, parent_container);  
            }
        });
        rssi_container.reprocess();
    }
    
    auto_message()
    {
        return this._el.querySelector('#esp32-mesh-auto-send-message').checked;
    }
    
    _create_element(apps_ids)
    {
        let el = document.createElement('div');
        el.innerHTML = `<style>${style.toString()}</style>
                        <label for=esp32-mesh-id class=script-label>ID:</label>
                        <select id=esp32-mesh-id class=script-input-id-select></select><br>
                        <input type=checkbox id=esp32-mesh-compare-type checked>
                        <label for=esp32-mesh-compare-type class=script-label>ID match exactly</label><br>
                        <input type=checkbox id=esp32-mesh-auto-send-message checked>
                        <label for=esp32-mesh-auto-send-message class=script-label>Auto-send messages</label><br>
                        <button id=esp32-mesh-open-window disabled=true>Open window</button><br>`;
        
        el.querySelector('#esp32-mesh-open-window').onclick = event => {
            this._open_window(event);
        }
                        
        return el;
    }
      
    _create_modal()
    {
        this._modal = document.createElement('my-modal');
        this._modal.setAttribute('id', 'esp32-mesh-modal');
        
        this._modal.innerHTML = `<style>${script_style.toString()}</style>
                    <div id=esp32-mesh-modal-container>
                        <h3 id=esp32-mesh-modal-title>ESP32 Mesh</h3>
                            <div id=esp32-mesh-content>
                                <my-tabs id=esp32-mesh-content-tabs>
                                    <button slot=title>Overview</button>
                                    <section class=esp32-mesh-content-panel>
                                        <table class=esp32-mesh-script-table>
                                            <tr><th>Router MAC</th><th>Name</th></tr>
                                            <tbody id=esp32-mesh-router-table-tbody>
                                                <tr><td colspan=20>No router info</td></tr>
                                            </tbody>
                                        </table>
                                        <table class=esp32-mesh-script-table>
                                            <tr>
                                                <th>NET ID</th>
                                                <th>Name</th>
                                                <th>Num devs</th>
                                                <th>Layers</th>
                                                <th>Addr</th>
                                                <th>Device</th>
                                                <th>Comm</th>
                                            </tr>
                                            <tbody id=esp32-mesh-net-list-body><tr><td colspan=20>No NET ID</td></tr></tbody>
                                        </table>
                                        <div><b>Device List</b></div>
                                        <table class=esp32-mesh-script-table>
                                            <tr>
                                                <th>MAC</th>
                                                <th>Name</th>
                                                <th>Layer</th>
                                                <th>Parent</th>
                                                <th>Mesh ID</th>
                                                <th>Version</th>
                                                <th>Ch config</th>
                                                <th>Ch conn</th>
                                                <th>RSSI</th>
                                                <th>MAC AP</th>
                                                <th>Is root</th>
                                                <th>Comm</th>
                                            </tr>
                                            <tbody id=esp32-mesh-device-body><tr><td colspan=20>No device listed</td></tr><tbody>
                                        </table>
                                    </section>
                                <button slot=title>Messages</button>
                                <section class=esp32-mesh-content-panel>    
                                    <button id=esp32-mesh-clear-messages>Clear</button>
                                    <input type=checkbox id=esp32-mesh-auto-scroll-messages checked>
                                    <label for=esp32-mesh-auto-scroll-messages>Auto-scroll</label>
                                    <div id=esp32-mesh-table-messages-container>
                                        <table id=esp32-mesh-messages-table class=esp32-mesh-script-table>
                                            <thead id=esp32-mesh-messages-head>
                                                <tr><th colspan=2>#</th><th colspan=3>BR</th><th colspan=4>Node</th></tr>
                                                <tr>
                                                    <th>Time</th><th>Dir</th>
                                                    <th>Ver</th><th>Addr</th><th>Size</th>
                                                    <th>Ver</th><th>Type</th><th>Size</th><th>Data</th>
                                                </tr>
                                            </thead>
                                            <tbody id=esp32-mesh-messages-body><tbody>
                                        </table>
                                    </div>
                                </section>
                                </my-tabs>
                            </div>
                            <div id=esp32-mesh-comm-error></div>
                            <esp32-br-input id=esp32-mesh-comm-input>
                                <div id=esp32-mesh-comm-input-br-container>
                                    <select id=esp32-mesh-comm-clients-select></select>
                                    <div>BR Comm</div>
                                    <div id=esp32-mesh-comm-br-raw></div>
                                </div>
                            </esp32-br-input>
                        </div>`;

        this._modal.querySelector('#esp32-mesh-comm-input').addEventListener('send_click', ev => {
            let to = this._get_client_selected();
            if(to)
                this.emit(ESP32_Events.SEND_MESSAGE, {data: new Uint8Array(ev.target.value), to: to});
            else
                this.error('Error selecting BR');
        });
        
        this._modal.querySelector('#esp32-mesh-clear-messages').onclick = ev => {
            this._modal.querySelector('#esp32-mesh-messages-body').innerHTML = '';
        }
        
        this._set_br_commands();
        
        document.body.appendChild(this._modal);
    }
    
    selected_id()
    {
        return get_selected(this._el.querySelector('#esp32-mesh-id'));
    }
    
    compare_types_check()
    {
        return this._el.querySelector('#esp32-mesh-compare-type').checked;
    }
    
    _open_window(event)
    {
        this._modal.show = true;
    }
        
    _format_command_route_table(data)
    {
        let formated = `ROUTE_TABLE layer:${data[Mesh_Info.LAYER]} parent:${data[Mesh_Info.PARENT]} children:[`;
        
        data.children.forEach((child, idx) => {
            formated += child;
            if(idx != (data.children.length - 1)) formated += ', ';
        });
        
        return formated + ']';
    }
    
    _format_command_config(data)
    {
        return `CONFIG id:${data[Mesh_Info.MESH_ID]} mac_ap:${data[Mesh_Info.MAC_AP]} is_root:${data[Mesh_Info.IS_ROOT]} ch_config:${data[Mesh_Info.CH_CONFIG]} ch_conn:${data[Mesh_Info.CH_CONN]}`;
    }
    
    _format_command_status(data)
    {
        return `STATUS rssi:${data[Mesh_Info.RSSI]}`;
    }
    
    _format_command_full_config(data)
    {
        let formated =  `FULL_CONFIG id:${data[Mesh_Info.MESH_ID]} mac_ap:${data[Mesh_Info.MAC_AP]} is_root:${data[Mesh_Info.IS_ROOT]} ch_config:${data[Mesh_Info.CH_CONFIG]} ch_conn:${data[Mesh_Info.CH_CONN]} rssi:${data[Mesh_Info.RSSI]} layer:${data[Mesh_Info.LAYER]} parent:${data[Mesh_Info.PARENT]} children:[`;
        
        data.children.forEach((child, idx) => {
            formated += child;
            if(idx != (data.children.length - 1)) formated += ', ';
        });
        
        return formated + ']';
    }
    
    _format_command_info(data)
    {
        return `${data[Mesh_Info.COMMAND_TYPE_NAME]} ${data[Mesh_Info.INFO]}`
    }
    
    _format_command(data)
    {
        switch(+data.command_type)
        {
            case Node_Command_Type.ROUTE_TABLE:
                return this._format_command_route_table(data);
            case Node_Command_Type.CONFIG:
                return this._format_command_config(data);
            case Node_Command_Type.STATUS:
                return this._format_command_status(data);
            case Node_Command_Type.FULL_CONFIG:
                return this._format_command_full_config(data);
            case Node_Command_Type_Response.INFO:
                return this._format_command_info(data);
            default:
                console.warn('Node command not defined [' + +data.command_type + ']');
        }
        return '';
    }
    
    _format_data(data)
    {
        return data.data;
    }
    
    _format_data_field(data)
    {
        switch(+data.message_type)
        {
            case Node_Message_Type.DATA:
                return this._format_data(data);
            case Node_Message_Type.COMMAND:
                return this._format_command(data);
        }
        return '';
    }
    
    _get_client_selected()
    {
        let sel = get_selected(this._modal.querySelector('#esp32-mesh-comm-clients-select'));
        return sel ? JSON.parse(sel.value) : false;
    }
    
    _set_br_commands()
    {
        let el = this._modal.querySelector('#esp32-mesh-comm-br-raw');
        Object.keys(BR_Command_Type).forEach(comm => {
           let button = document.createElement('button');
            button.setAttribute('class', 'esp32-mesh-comm-br-raw-op');
            button.textContent = comm.slice(0,2);
            button.onclick = ev => {
                let sel = this._get_client_selected();
                if(sel){
                    this._model._send_br_command(sel, BR_Command_Type[comm]);
                }
            }
            button.title = comm;
            el.appendChild(button);
        });
    }
}

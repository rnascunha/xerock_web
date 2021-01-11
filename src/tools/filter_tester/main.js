import {make_filter} from '../../js/core/libs/filter/functions.js';
import {Filter_Events} from '../../js/core/libs/filter/types.js';
import {Message_Direction, Message_Type, Control_Type} from '../../js/core/libs/message_factory.js';

let filter_options = {
                      "sid": {
                        "0": {
                          "webusb": [],
                          "webserial": []
                        },
                        "1": {
                          "main": [],
                          "tcp_server": ["0.0.0.0:8089"],
                          "serial": [],
                          "echo": ["1"]
                        },
                        "2": {
                          "main": [],
                          "tcp_server": [],
                          "serial": [],
                          "echo": ["2"],
                          "monitor": ["2"]
                        }
                      },
                      "dir": Object.keys(Message_Direction),
                      "type": Object.keys(Message_Type),
                      "ctype": Object.keys(Control_Type),
                      "session": {
                        "0": ["-", 0, 1, 2],
                        "1": [4, 5, 6, 8, 9, 12, 20],
                        "2": [1, 7, 11]
                      },
                      "appf": ["webusb","webserial","main","tcp_server","serial","echo","monitor"]
                    }

let filter = make_filter(document.querySelector('#filter-container'), filter_options, {}, {unselect: true});

filter.on(Filter_Events.RENDER_DATA, filter => {
    document.querySelector('#filter-data').innerHTML = JSON.stringify(filter, undefined, 2);;
});

filter.on(Filter_Events.RENDER_FILTER, options => {
    document.querySelector('#filter-options').innerHTML = JSON.stringify(options, undefined, 2);
});

filter.emit(Filter_Events.RENDER_FILTER, filter.filter_options());
filter.emit(Filter_Events.RENDER_DATA, filter.get());
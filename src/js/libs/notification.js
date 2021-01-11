
let sw = null;

function init(sw_){ sw = sw_; }

//export function ask_permission(){
//    return new Promise(function(resolve, reject) {
//        const permissionResult = Notification.requestPermission(function(result) {
//            resolve(result);
//        });
//
//        if (permissionResult) {
//            permissionResult.then(resolve, reject);
//        }
//    }).then(function(permissionResult) {
//        if (permissionResult !== 'granted') {
//            throw new Error('We weren\'t granted permission.');
//        }
//    });
//}

//https://developers.google.com/web/fundamentals/push-notifications/common-notification-patterns#the_exception_to_the_rule
function is_client_focused()
{
    return sw.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        let clientIsFocused = false;

        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (windowClient.focused) {
                clientIsFocused = true;
//                return windowClient;
                break;
            }
        }

        return clientIsFocused;
    });
}


function post(title, options)
{
    if(sw) sw.registration.showNotification(title, options);
}

function post_if(title, options, if_not_cb = null)
{
    is_client_focused().then(is => {
        if(is) post(title, options);
        else if(if_not_cb) if_not_cb(title, options);
    });
}
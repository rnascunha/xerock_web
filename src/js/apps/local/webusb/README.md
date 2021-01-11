* https://developers.google.com/web/fundamentals/native-hardware/build-for-webusb

Permission
* https://developers.google.com/web/updates/2016/03/access-usb-devices-on-the-web

Spec
* https://wicg.github.io/webusb/

cp210x drivers
* https://gist.github.com/FeedDahBirds/98301084ce13898fa72c610f211e1e76
* https://github.com/phoddie/runmod/blob/master/html/xsbug.js#L259
* https://www.silabs.com/documents/public/application-notes/AN571.pdf

* USB CDC 1.1
** https://cscott.net/usb_dev/data/devclass/usbcdc11.pdf

Unbind driver at linux
* https://stackoverflow.com/a/47724582
** sudo sh -c 'echo -n "<bus>-<port>:1.0" > /sys/bus/usb/drivers/<driver>/unbind'
*** bus and driver check at dmesg


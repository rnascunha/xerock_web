export const Events = {
    REQUEST: Symbol('request'),
    GET: Symbol('get'),
    ADD_DEVICE: Symbol('add device'),
    ERROR: Symbol('error'),
    OPEN: Symbol('open'),
    CLOSE: Symbol('close'),
    SCAN_LE: Symbol('scan le')
}

//List taked from: https://googlechrome.github.io/samples/web-bluetooth/device-info.html
//Oficial GATT list: https://www.bluetooth.com/specifications/gatt/
export const GATT_Service_List = [
    "alert_notification",
    "automation_io",
    "battery_service",
    "blood_pressure",
    "body_composition",
    "bond_management",
    "continuous_glucose_monitoring",
    "current_time",
    "cycling_power",
    "cycling_speed_and_cadence",
    "device_information",
    "environmental_sensing",
    "generic_access",
    "generic_attribute",
    "glucose",
    "health_thermometer",
    "heart_rate",
    "human_interface_device",
    "immediate_alert",
    "indoor_positioning",
    "internet_protocol_support",
    "link_loss",
    "location_and_navigation",
    "next_dst_change",
    "phone_alert_status",
    "pulse_oximeter",
    "reference_time_update",
    "running_speed_and_cadence",
    "scan_parameters",
    "tx_power",
    "user_data",
    "weight_scale"
];
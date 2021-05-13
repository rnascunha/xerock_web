export const connection_type = {
    unreliable: {value: 'unreliable', name: 'UDP'},
    reliable: {value: 'reliable', name: 'TCP/WS'}
}

export const protocol = {
    coap: {value: 'coap', name: 'coap', type: 'unreliable'},
    coaps: {value: 'coaps', name: 'coaps', type: 'unreliable'},
    coap_tcp: {value: 'coap+tcp', name: 'coap+tcp', type: 'reliable', set_length: true},
    coaps_tcp: {value: 'coaps+tcp', name: 'coaps+tcp', type: 'reliable', set_length: true},
    coap_ws: {value: 'coap+ws', name: 'coap+ws', type: 'reliable', set_length: false},
    coaps_ws: {value: 'coaps+ws', name: 'coaps+ws', type: 'reliable', set_length: false},
}

export const version = 1;
export const payload_marker = 0xff;

export const type = {
    confirmable: {value: 'confirmable', name: 'CON', code: 0},
    nonconfirmable: {value: 'nonconfirmable', name: 'NON', code: 1},
    acknowledgment: {value: 'acknowledgment', name: 'ACK', code: 2},
    reset: {value: 'reset', name: 'RESET', code: 3},
}

export function type_by_code(code)
{
    return Object.values(type).find(t => t.code == code);
}

export const code_class = {
    request: { value: 'request', code: 0, name: 'Request'},
	//Response
	success: { value: 'success', code: 2, name: 'Success'},
	client_error: { value: 'client_error', code: 4, name: 'Client Error'},
	server_error: { value: 'server_error', code: 5, name: 'Server Error'},
    //signal
	signaling: { value: 'signaling', code: 7, name: 'Signaling'},
};

export function make_code(class_code, detail)
{
    return (class_code << 5) | detail;
}

export function is_code_class(class_code, code)
{
    return (code >> 5) == class_code;
}

export function is_empty(code){ return code == 0; }

export function is_request(code)
{
    return is_code_class(code_class.request.code, code) && !is_empty(code);
}

export function is_client_error(code)
{
    return is_code_class(code_class.client_error.code, code);
}

export function is_server_error(code)
{
    return is_code_class(code_class.server_error.code, code);
}

export function is_success(code)
{
    return is_code_class(code_class.success.code, code);
}

export function is_response(code)
{
    return is_client_error(code) | is_success(code) | is_server_error(code);
}

export function is_signaling(code)
{
    return is_code_class(code_class.signaling.code, code);
}

export const code = {
    empty: {value: 'empty', str_code: '0.00', name: 'Empty', code: 0},
    get: {value: 'get', str_code: '0.01', name: 'GET', code: make_code(code_class.request.code, 1)},
    post: {value:'post', str_code: '0.02', name: 'POST', code: make_code(code_class.request.code, 2)},
    put: {value: 'put', str_code: '0.03', name: 'PUT', code: make_code(code_class.request.code, 3)},
    delete: {value: 'delete', str_code: '0.04', name: 'DELETE', code: make_code(code_class.request.code, 4)},
    fetch: {value: 'fetch', str_code: '0.05', name: 'FETCH', code: make_code(code_class.request.code, 5)},
    patch: {value: 'patch', str_code: '0.06', name: 'PATCH', code: make_code(code_class.request.code, 6)},
    ipatch: {value: 'ipatch', str_code: '0.07', name: 'IPATCH', code: make_code(code_class.request.code, 7)},
    success: {value: 'success', code: make_code(code_class.success.code, 0), str_code: '2.00', name: 'Success'},
	created: {value: 'created', code: make_code(code_class.success.code, 1), str_code: '2.01', name: ' Created'},
	deleted: {value: 'deleted', code: make_code(code_class.success.code, 2), str_code: '2.02', name: ' Deleted'},
	valid: {value: 'valid', code: make_code(code_class.success.code, 3), str_code: '2.03', name: 'Valid'},
	changed: {value: 'changed', code: make_code(code_class.success.code, 4), str_code: '2.04', name: 'Changed'},
	content: {value: 'content', code: make_code(code_class.success.code, 5), str_code: '2.05', name: 'Content'},
	continue: {value: 'continue', code: make_code(code_class.success.code, 31), str_code: '2.31', name: ' Continue'},
	//Client Error
	bad_request: {value: 'bad_request', code: make_code(code_class.client_error.code, 0), str_code: '4.00', name: 'Bad Request'},
	unauthorized: {value: 'unauthorized', code: make_code(code_class.client_error.code, 1), str_code: '4.01', name: 'Unauthorized'},
	bad_option: {value: 'bad_option', code: make_code(code_class.client_error.code, 2), str_code: '4.02', name: 'Bad Option'},
	forbidden: {value: 'forbidden', code: make_code(code_class.client_error.code, 3), str_code: '4.03', name: 'Forbidden'},
	not_found: {value: 'not_found', code: make_code(code_class.client_error.code, 4), str_code: '4.04', name: 'Not Found'},
	method_not_allowed: {value: 'method_not_allowed', code: make_code(code_class.client_error.code, 5), str_code: '4.05', name: 'Method Not Allowed'},
	not_accpetable: {value: 'not_accpetable', code: make_code(code_class.client_error.code, 6), str_code: '4.06', name: 'Not Acceptable'},
	request_entity_incomplete: {value: 'request_entity_incomplete', code: make_code(code_class.client_error.code, 8), str_code: '4.08', name: 'Request Entity Incomplete'},
	conflict: {value: 'conflict', code: make_code(code_class.client_error.code, 9), str_code: '4.09', name: 'Conflict'},
	precondition_failed: {value: 'precondition_failed', code: make_code(code_class.client_error.code, 12), str_code: '4.12', name: 'Precondition Failed'},
	request_entity_too_large: {value: 'request_entity_too_large', code: make_code(code_class.client_error.code, 13), str_code: '4.13', name: 'Request Entity Too Large'},
	unsupported_content_format: {value: 'unsupported_content_format', code: make_code(code_class.client_error.code, 15), str_code: '4.15', name: 'Unsupported Content-Format'},
	unprocessable_entity: {value: 'unprocessable_entity', code: make_code(code_class.client_error.code, 22), str_code: '4.22', name: 'Unprocessable Entity'},
	//Server Error
	internal_server_error: {value: 'internal_server_error', code: make_code(code_class.server_error.code, 0), str_code: '5.00', name: 'Internal Server Error'},
	not_implemented: {value: 'not_implemented', code: make_code(code_class.server_error.code, 1), str_code: '5.01', name: 'Not Implemented'},
	bad_gateway: {value: 'bad_gateway', code: make_code(code_class.server_error.code, 2), str_code: '5.02', name: 'Bad Gateway'},
	service_unavaiable: {value: 'service_unavaiable', code: make_code(code_class.server_error.code, 3), str_code: '5.03', name: 'Service Unavailable'},
	gateway_timeout: {value: 'gateway_timeout', code: make_code(code_class.server_error.code, 4), str_code: '5.04', name: 'Gateway Timeout'},
	proxying_not_supported: {value: 'proxying_not_supported', code: make_code(code_class.server_error.code, 5), str_code: '5.05', name: 'Proxying Not Supported'},
	hop_limit_reached: {value: 'hop_limit_reached', code: make_code(code_class.server_error.code, 8), str_code: '5.08', name: 'Hop Limit Reached'},
    csm: {value: 'csm', code: make_code(code_class.signaling.code, 1), str_code: '7.01', name: 'CSM'},
	ping: {value: 'ping', code: make_code(code_class.signaling.code, 2), str_code: '7.02', name: 'Ping'},
	pong: {value: 'pong', code: make_code(code_class.signaling.code, 3), str_code: '7.03', name: 'Pong'},
	release: {value: 'release', code: make_code(code_class.signaling.code, 4), str_code: '7.04', name: 'Release'},
	abort: {value: 'abort', code: make_code(code_class.signaling.code, 5), str_code: '7.05', name: 'Abort'}
};

export function code_by_code(ccode)
{
    return Object.values(code).find(c => c.code == ccode);
}

export const option = {
    if_match: {value: 'if_match', code: 1, name: 'If-Match', type: 'opaque', repeatable: true, min: 0, max: 8},
	uri_host: {value: 'uri_host', code: 3, name: 'Uri-Host', type: 'string', repeatable: false, min: 1, max: 255},
	etag: {value: 'etag', code: 4, name: 'ETag', type: 'opaque', repeatable: true, min: 1, max: 8},
	if_none_match: {value: 'if_none_match', code: 5, name: 'If-None-Match', type: 'empty', repeatable: false},
	observe: {value: 'observe', code: 6, name: 'Observe', type: 'uint', repeatable: false, min: 0, max: 3},
	uri_port: {value: 'uri_port', code: 7, name: 'Uri-Port', type: 'uint', repeatable: false, min: 0, max: 2},
	location_path: {value: 'location_path', code: 8, name: 'Location-Path', type: 'string', repeatable: true, min: 0, max: 255},
	uri_path: {value: 'uri_path', code: 11, name: 'Uri-Path', type: 'string', repeatable: true, min: 0, max: 255},
	content_format: {value: 'content_format', code: 12, name: 'Content-Format', type: 'uint', repeatable: false, min: 0, max: 2},
	max_age: {value: 'max_age', code: 14, name: 'Max-Age', type: 'uint', repeatable: false, default: 60, min: 0, max: 4},
	uri_query: {value: 'uri_query', code: 15, name: 'Uri-Query', type: 'string', repeatable: true, min: 0, max: 255},
	hop_limit: {value: 'hop_limit', code: 16, name: 'Hop-Limit', type: 'uint', repeatable: false, min: 1, max: 1, default: 16},
	accept: {value: 'accept', code: 17, name: 'Accept', type: 'uint', repeatable: false, min: 0, max: 2},
	location_query: {value: 'location_query', code: 20, name: 'Location-Query', type: 'string', repeatable: true, min: 0, max: 2},
	block2: {value: 'block2', code: 23,	name: 'Block2', type: 'uint', repeatable: false, min: 0, max: 3},
	block1: {value: 'block1', code: 27, name: 'Block1', type: 'uint', repeatable: false, min: 0, max: 3},
	size2: {value: 'size2', code: 28, name: 'Size2', type: 'uint', repeatable: false, min: 0, max: 4},
	proxy_uri: {value: 'proxy_uri', code: 35, name: 'Proxy-Uri', type: 'string', repeatable: false, min: 1, max: 1034},
	proxy_scheme: {value: 'proxy_scheme', code: 39, name: 'Proxy-Scheme', type: 'string', repeatable: false, min: 1, max: 255},
	size1: {value: 'size1', code: 60, name: 'Size1', type: 'uint', repeatable: false, min: 0, max: 4},
	no_response: {value: 'no_response', code: 258, name: 'No response', type: 'uint', repeatable: false, default: 0, min: 0, max: 1}
};

export function option_by_code(code)
{
    return Object.values(option).find(o => o.code == code);
}

export const content_format = {
    text_plain: {value: 'text_plain', code: 0, name: 'text/plain;charset=utf-8'},
    application_link_format: {value: 'application_link_format', code: 40, name: 'application/link-format'},
    application_xml: {value: 'application_xml', code: 41, name: 'application/xml'},
    application_octet_stream: {value: 'application_octet_stream', code: 42, name: 'application/octet-stream'},
    application_exi: {value: 'application_exi', code: 47, name: 'application/exi'},
    application_json: {value: 'application_json', code: 50, name: 'application/json'},
    application_json_patch_json: {value: 'application_json_patch_json', code: 51, name: 'application/json-patch+json'},
    application_merge_patch_json: {value: 'application_merge_patch_json', code: 52, name: 'application/merge-patch+json'}
};

export function content_format_by_code(code)
{
    return Object.values(content_format).find(t => t.code == code);
}

export const no_response = {
  	success: {value: 'success', code: 0b00000010, name: 'Success'},
	client_error: {value: 'client_error', code: 0b00001000, name: 'Client Error'},
	server_error: {value: 'server_error', code: 0b00010000, name: 'Server Error'}  
};

export const type_request = [type.CON, type.NON];
export const request = Object.values(code).filter(c => is_request(c.code));
export const request_default = Object.values(code).filter(c => is_request(c.code) && c.code <= 4);
export const response = Object.values(code).filter(c => is_response(c.code));
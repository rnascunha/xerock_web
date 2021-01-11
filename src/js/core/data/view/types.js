
export const View_Events = {
    REGISTER_VIEW: Symbol('register view'),
    OPEN_VIEW: Symbol('open view'),
    REMOVE_VIEW: Symbol('remove view'),
    SELECT_ID: Symbol('select id')
}

export const html_view = (name) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="shortcut icon" href="/websocket/favicon.ico" type="image/x-icon">
    <title>${name}</title>
</head>
<body></body>
</html>`;
}

export const html_head = (name) => {
    return `
    <meta charset="UTF-8">
    <link rel="shortcut icon" href="/websocket/favicon.ico" type="image/x-icon">
    <title>${name}</title>`;
}
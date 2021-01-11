
//https://stackoverflow.com/a/1484514
export function generate_random_color() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++)
        color += letters[Math.floor(Math.random() * 16)];
    return color;
}

export function expand_short_color(color)
{
    return color.replace(/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/, '#$1$1$2$2$3$3');
}
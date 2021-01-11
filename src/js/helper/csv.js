//http://creativyst.com/Doc/Articles/CSV/CSV01.htm
export function check_csv_char(data, sep){
    if(typeof data !== 'string') return data;
    if([...data].findIndex(d => d == sep || d == ' ' || d == '\n') != -1){
        return `"${data}"`;
    }
    return data;
}

export function make_csv_data(data, options = {header: null, sep: ',', add_cr: false, add_sep: false})
{    
    let sep = options.sep || ',', 
        header = options.header || null,
        nl = options.add_cr ? '\r\n' : '\n',
        new_data = '';
    
    if(options.add_sep)
        new_data += `sep=${sep}${nl}`;
    
    let sep_s = sep + ' ';
    if(header){
        header.forEach((h) => {
            new_data += check_csv_char(h, sep) + sep_s;
        });
        new_data = new_data.slice(0, -2) + nl;
    }
    
    data.forEach(line => {
       line.forEach(col => {
           new_data += check_csv_char(col, sep) + sep_s;
       });
        new_data = new_data.slice(0, -2) + nl;
    });
    new_data.slice(-nl.length);
        
    return new_data;
}
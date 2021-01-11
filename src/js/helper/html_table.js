export function make_html_table(data, options = {header: null, footer: null}){
    let header = options.header || null,
        footer = options.footer || null;
    
    let table = document.createElement('table');
    if(header){
        let thead = document.createElement('thead');
        let tr = document.createElement('tr');
        header.forEach(h => {
            let td = document.createElement('th');
            td.textContent = h;
            tr.appendChild(td);
        });
        thead.appendChild(tr);
        table.appendChild(thead);
    }
    
    if(footer){
       let tfoot = document.createElement('tfoot');
        let tr = document.createElement('tr');
        footer.forEach(h => {
            let td = document.createElement('td');
            td.textContent = h;
            tr.appendChild(td);
        });
        tfoot.appendChild(tr);
        table.appendChild(tfoot); 
    }
    
    let tbody = document.createElement('tbody');
    data.forEach(line => {
        let tr = document.createElement('tr');
        line.forEach(col => {
            let td = document.createElement('td');
            td.textContent = col;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    
    return table;
}
export function remove_leading_zeros(data)
{
    let flag = false;
    let n_data = data.filter(d => {
        if(!flag && d == 0) return false;
        else {
            flag = true;
            return true;
        }
    });
    
    return n_data;
}
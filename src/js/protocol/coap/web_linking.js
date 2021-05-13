
export class Weblink{
    static parse(data, level = -1)
    {
        //Break resources
        let ds = data.split(',');

        //Break resource description
        let ds1 = [];
        ds.forEach(d => {
            let s = d.split(';')
            ds1.push({path: s.shift(), description: s});
        });

        //Remove '<'/'>' from the resource link
        ds1.forEach(d => {
           d.path = d.path.replace(/^<(.*)>$/, '$1');
        })

        //Break resource description values
        ds1.forEach(d => {
            if(!d.description) 
            {
                d.description = {};
                return;
            }

            let new_desc = {};
            d.description.forEach(dd => {
                let ddd = dd.split('=');
                new_desc[ddd[0]] = ddd[1] ? ddd[1] : [];
            });
            d.description = new_desc;
        });

        if(level > 0 && level == 1)
            return ds1;

        //Break path resources
        ds1.forEach(p => {
            p.path = p.path.split('\/');
            if(p.path[0].length == 0) p.path.shift();
        });

        return ds1;
    }

    static make_tree(dataweb)
    {
        let doc = Weblink.parse(dataweb),
            root_path = '',
            root_tree = {
                name: root_path, 
                children: [], 
                description: {}, 
                level: 0, 
                value: null
            };

        //Populate root
        let new_doc = [];
        doc.some(d => {
            if(d.path[0] == root_path && d.path.length == 1)
            {
                root_tree.description = d.description;
                root_tree.value = d;
            }
            else
            {
                new_doc.push(d);
            }
        });

        //Function to create tree
        function make_tree(tree, data)
        {
            let child_list = {};
            data.forEach(d => {
                let set = tree.children.some(c => {
                    if(c.name == d.path[tree.level])
                    {
                        if(d.path.length == 1)
                        {
                            c.description = d.description;
                            c.value = d;
                        }
                        else
                        {
                            child_list[c.name].push(d);
                        }
                        return true;
                    }
                });
                //If not created, create child tree node
                if(!set)
                {
                    let t = {
                        name: d.path[tree.level], 
                        children: [], 
                        description: {},
                        level: tree.level + 1,
                        value: null
                    };
                    child_list[t.name] = [];
                    if(d.path.length > t.level)
                        child_list[t.name].push(d);
                    else
                    {
                        t.description = d.description;
                        t.value = d;
                    }
                    tree.children.push(t);
                }
            });

            //Call recursivily to all childs that have child
            tree.children.forEach(c => {
                if(child_list[c.name].length)
                    make_tree(c, child_list[c.name]);
            });

            return tree;
        }

        return make_tree(root_tree, new_doc);
    }

}

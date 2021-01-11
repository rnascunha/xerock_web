const w_state = {
    NORMAL: Symbol('normal'),
    MAXIMIZED: Symbol('maximized')
}

const default_state = {
    grid: [
            ['header', 'header', 'header'],
            ['scripts', 'data', 'options'],
            ['input', 'input', 'options']
        ],
    options: 'block',
    scripts: 'none',
    input: 'block',
    state: w_state.NORMAL
}

const template = document.createElement('template');
template.innerHTML = `
<style>
    #wrapper{
        background: black;
        height: 100%;
        width: 100%;
        display: grid;
        grid-template-columns: 250px auto 300px;
        grid-template-rows: 25px auto 90px;
        grid-template-areas: "header header header"
                            "scripts data options"
                            "input input options";
        grid-gap: 3px 3px;
    }

    #header{
        background: red;
        grid-area: header;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding-left: 3px;
        padding-right: 3px;
    }

    #title
    {
        margin-top: 4px;
        font-family: "Courier", Times, serif;
        font-size: 25px;
        font-weigth: bold;
    }

    #title:after
    {
        content: var(--app-title, 'Xerock');
    }

    #profile
    {
        display: inline-flex;
        border: 2px solid brown;
        border-radius: 3px;
        height: 80%;
        margin: auto 2px;
        align-items: center;
    }

    #data{
        background: green;
        grid-area: data;
    }

    #input{
        background: yellow;
        grid-area: input;
    }

    #options{
        background: blue;
        grid-area: options;
    }

    #scripts{
        background: orange;
        grid-area: scripts;
    }

    #views
    {
        display: inline-flex;
        border: 2px solid brown;
        border-radius: 3px;
        height: 80%;
        margin: auto 2px;
        align-items: center;
    }

    .view-btn
    {
        padding: 2px;
        height: 100%;
        cursor: pointer;
        margin: auto 2px;
        color: black;
        font-weight: bold;
    }

    .view-btn[data-active=false]
    {
        opacity: 0.2;
    }

    #scripts-btn:hover,
    #input-btn:hover,
    #options-btn:hover
    {
        transform: translateY(4px);
    }

    .view-btn:hover
    {
        opacity: 1;
    }

    .view-btn[data-active=false]:hover
    {
        opacity: 0.5;
    }

    #scripts-btn
    {
        transform: translateY(-1px);
    }

    #scripts-btn:after
    {
        content: '\u2211';  
    }

    #input-btn
    {
        transform: translateY(1px);
    }

    #input-btn:after
    {
        content: '\u2200';
    }

    #options-btn
    {
        transform: translateY(1px);
    }

    #options-btn:after
    {
        content: '\u2630';
    }

    #configure
    {
        display: inline-block;
        font-size: 1.4em;
        transform: translateY(2px);
        cursor: pointer;
    }

    #configure:hover{
        transform: translateY(4px);
    }

    #configure:after{
        content: '\u2699';
    }

    #about
    {
        display: inline-block;
        font-size: 1.4em;
        transform: translateY(2px);
        cursor: pointer;
    }

    #about:hover{
        transform: translateY(4px);
    }

    #about:after{
        content: '\u00A9';
    }
</style>
<div id=wrapper>
    <div id=header>
        <span id=profile></span>
        <span id=title></span>
        <span>
            <select id=tools-menu></select>
            <div id=views>
                <span id=scripts-btn class=view-btn title='Scripts View'></span>
                <span id=input-btn class=view-btn title='Input View'></span>
                <span id=options-btn class=view-btn title='Apps View'></span>
            </div>
            <span id=configure title=Configure></span>
            <span id=about title=About></span>
        </span>
    </div>
    <w-container name=data closeable=false id=data>Data</w-container>
    <w-container name=input maximizable=false id=input>Input</w-container>
    <w-container name=options maximizable=false id=options>Options</w-container>
    <w-container name=scripts maximizable=false id=scripts>Scripts</w-container>
</div>`;

export default class Window_Manager
{
    constructor(container, state = {})
    {
//        this._raw_container = container;
        this._container = container;
//        this._container = this._raw_container.attachShadow({mode: 'open'});
        this._container.appendChild(template.content.cloneNode(true));
        
        this._wrapper = this._container.querySelector('#wrapper');
        this._data = this._container.querySelector('#data'),
        this._scripts = this._container.querySelector('#scripts'),
        this._input = this._container.querySelector('#input'),
        this._options = this._container.querySelector('#options');
        
        this._scripts_btn = this._container.querySelector('#scripts-btn'),
        this._input_btn = this._container.querySelector('#input-btn'),
        this._options_btn = this._container.querySelector('#options-btn');
        
        this._old_state = null;
        
        this._state = state.state;
        this.load_state({...default_state, ...state});
                        
        this._data.addEventListener('maximize', this._maximize.bind(this, this._data));
        this._data.addEventListener('minimize', this._minimize.bind(this, this._data));
        
        this._options.addEventListener('close', this._close_options.bind(this));
        this._container.querySelector('#options-btn').addEventListener('click', ev => {
            if(this._state === w_state.MAXIMIZED) return;
            this._close_options();
        });
        
        this._input.addEventListener('close', this._close_input.bind(this));
        this._container.querySelector('#input-btn').addEventListener('click', ev => {
            if(this._state === w_state.MAXIMIZED) return;
            this._close_input();
        });
        
        this._scripts.addEventListener('close', this._close_scripts.bind(this));
        this._container.querySelector('#scripts-btn').addEventListener('click', ev => {
            if(this._state === w_state.MAXIMIZED) return;
            this._close_scripts();
        });
    }
    
    containers()
    {
        return {
            header: this._container.querySelector('#header'),
            data: this._data,
            input: this._input,
            options: this._options,
            scripts: this._scripts
        }
    }
    
    load_state(state)
    {
        this._grid_state = state.grid;
        
        this._options.style.display = state.options;
        this._scripts.style.display = state.scripts;
        this._input.style.display = state.input;

        this._close_scripts(false);
        this._set_close(this._scripts_btn, !this._is_show(this._scripts));
        
        this._close_options(false);
        this._set_close(this._options_btn, !this._is_show(this._options));
        
        this._close_input(false);
        this._set_close(this._input_btn, !this._is_show(this._input));
        
        this._state = state.state;
        if(this._state === w_state.MAXIMIZED){
            this._maximize(this._data);
        }
    }
    
    save_state()
    {
        return {
                grid: this._grid_state,
                options: this._options.style.display,
                scripts: this._scripts.style.display,
                input: this._input.style.display
            }
    }
    
    _render()
    {
        this._wrapper.style.gridTemplateAreas = this._make_state(this._grid_state);
    }
        
    _make_state(state)
    {
        return state.reduce((acc, line) =>
            acc + '"' + line.join(' ') + '" '
        , '')
    }

    _is_show(el)
    {
        return el.style.display !== 'none';
    }
    
    _maximize(el)
    {
        this._old_state = this.save_state();
            
        this._grid_state = [
            ['header', 'header', 'header'],
            ['data', 'data', 'data'],
            ['data', 'data', 'data']
         ];

        this._options.style.display = 'none';
        this._scripts.style.display = 'none';
        this._input.style.display = 'none';

        this._state = w_state.MAXIMIZED;
        el.set_maximize();
        this._render();
    }
    
    _minimize(el)
    {
        this._grid_state = this._old_state.grid;

        this._options.style.display = this._old_state.options;
        this._scripts.style.display = this._old_state.scripts;
        this._input.style.display = this._old_state.input;

        this._state = w_state.NORMAL;
        el.set_minimize();
        this._render();
    }

    _close_options(toggle = true)
    {   
        if((toggle && this._is_show(this._options)) 
           || (!toggle && !this._is_show(this._options)))
        {
            this._options.style.display = 'none';
            this._grid_state[1][2] = 'data';
            this._grid_state[2][2] = this._is_show(input) ? 'input' : 'data';
            this._set_close(this._options_btn, true);
        } 
        else 
        {
            this._options.style.display = 'block';
            this._grid_state[1][2] = 'options';
            this._grid_state[2][2] = 'options';
            this._set_close(this._options_btn, false);
        }
        this._render();
    }

    _close_input(toggle = true)
    {       
        if((toggle && this._is_show(this._input))
           || (!toggle && !this._is_show(this._input)))
        {
            this._input.style.display = 'none';
            this._grid_state[2][1] = 'data';
            this._grid_state[2][0] = this._is_show(scripts) ? 'scripts' : 'data';
            if(!this._is_show(this._options))
                this._grid_state[2][2] = 'data';
            this._set_close(this._input_btn, true);
        } 
        else 
        {
            this._input.style.display = 'block';
            this._grid_state[2][1] = 'input';
            this._grid_state[2][0] = 'input';
            if(!this._is_show(this._options))
                this._grid_state[2][2] = 'input';
            this._set_close(this._input_btn, false);
        }
        this._render();
    }

    _close_scripts(toggle = true)
    {        
        if((toggle && this._is_show(this._scripts))
           || (!toggle && !this._is_show(this._scripts)))
        {
            this._scripts.style.display = 'none';
            this._grid_state[1][0] = 'data';
            if(!this._is_show(this._input))
                this._grid_state[2][0] = 'data';
            this._set_close(this._scripts_btn, true);
        } 
        else 
        {
            this._scripts.style.display = 'block';
            this._grid_state[1][0] = 'scripts';
            if(!this._is_show(input))
                this._grid_state[2][0] = 'scripts';
            this._set_close(this._scripts_btn, false);
        }
        this._render();
    }
    
    _set_close(el, state = true)
    {
        el.dataset.active = !state;
    }
}

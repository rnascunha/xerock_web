
import style from './data_compare.css';

export const html_template = document.createElement('template');
html_template.innerHTML = `
<style>
    ${style.toString()}
</style>
<div id=container>
    <div id=header>
        <div id=selected-id></div>
        <div id=title></div>
        <div id=open-selector>Open</div>
    </div>
    <div id=content>
        <div id=options>
            <fieldset id=break-line-container>
                <legend>Break line</legend>
                <label><input type=radio name=break-line id=break-new-line checked>New line (0x0a)</label>
                <label><input type=radio name=break-line id=break-fixed-char>Fixed characters</label>
                <label><input type=number min=1 value=10 style='width:5ch' id=fixed-char-number disabled></label>
                <label><input type=radio name=break-line id=break-message>Message</label>
            </fieldset>
            <button id=add title='Add new view' class=option></button>
            <button id=clear title='Clear all data' class=option>Clear</button>
            <label class=option><input type=checkbox id=scroll checked>Auto-scroll</label>
        </div>
        <div id=data></div> 
    </div>
    <div id=status>Status</div>
</div>
`;

export const selector = `
<div id=select-container>
    <h3>Select ID</h3>
    <div>
        <select id=id></select>
        <button id=select-id-button>Select</button>
    </div>
</div>`;
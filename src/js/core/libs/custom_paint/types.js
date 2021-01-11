import {make_line_str} from './custom_filters.js';

export const default_filter = {
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                        fontSize: '14px',
                        fontFamily: 'monospace'
};

export const default_filter_hover = {
                        backgroundColor: '#ffff00',
                        color: '#000000',
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                        fontSize: '14px',
                        fontFamily: 'monospace'
};

//export const default_hover_bg = '#ffff00';

export const Output_Style_Events = {
    CHANGE_STYLE: 'change_style',
    ADD_CUSTOM: 'add_custom',
    REMOVE_CUSTOM: 'remove_custom',
    CHANGE_STYLE_VIEW: 'change_style_view'      //To diferentieate from the other
}

export const Output_Style_Type = {
    DEFAULT: 'default',
    HOVER: 'hover',
    CUSTOM: 'custom'
}

export const filter_default_class = 'filter-default';
export const filter_custom_class_prefix = 'custom-filter';

export const filter_config_section = `
<section id=filter-output-config-section>
    <div id=filter-output-config-container>
        <table style='text-align:center'>
            <thead>
                <tr>
                    <td>#</td><td>Bg</td><td>Color</td><td><b>Bold</b></td><td><i>Italic</i></td><td>Size</td><td>Family</td><td>Output</td>
                </tr>
            </thead>
            <tbody id=default-filter-table>
                ${make_line_str('default','default')}
                ${make_line_str('default:hover','default-hover')}
            </tbody>
        </table>
        <h3>Custom filters</h3>
        <table style='text-align:center'>
            <thead>
                <tr>
                    <td>#</td><td>Bg</td><td>Color</td><td><b>Bold</b></td><td><i>Italic</i></td><td>Size</td><td>Family</td><td>Output</td>
                </tr>
            </thead>
            <tbody id=custom-filter-table></tbody>
        </table>
        <button id=button-add-custom-filter>+</button>
    </div>
</section>`;

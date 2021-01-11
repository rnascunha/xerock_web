export const html_template = document.createElement('template');
html_template.innerHTML =
`
<style>
    .filter-row-attr
    {
        padding: 1px;
        margin: 1px;
        margin-left: 1px;
        margin-right: 1px;
        background-color: bisque;
        display: inline-block;
        border-radius: 5px;
    }

    .filter-button
    {
        outline: none;
    }

    .filter-button:hover
    {
        filter: brightness(115%);
        cursor: pointer;
    }

    .filter-button:first-child
    {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
    }

    .filter-button:last-child
    {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
    }

    .filter-selected{
        border-style: inset;
        background-color: darkgray;
        color: white;
    }

    .filter-unselected{
        border-style: outset;
    }

    /*
    *
    */
    .filter-sid
    {
        background-color: bisque;
        padding: 2px;
        display: inline-flex;
        flex-direction: row;
        flex-wrap: wrap;
        margin-right: 2px;
        border-radius: 5px;
        border: 3px solid brown;
    }

    .filter-sid-app
    {
        display: inline-block;
        margin-right: 4px;
    }

    .filter-sid-app-id
    {
        display: inline-block;
        margin-right: 4px;
    }

    .filter-button-app
    {
        border-top-right-radius: 0px !important;
        border-bottom-right-radius: 0px !important;
    }

    .filter-button-id
    {
    /*    margin-right: 2px;*/
    }

    .filter-commands label
    {
        background-color: antiquewhite;
        padding: 1px;
        border-radius: 3px;
    }
</style>
<div id=filter-list></div>`;
const website = 'https://rnascunha.github.io/xerock',
      daemon_proj = 'https://github.com/rnascunha/xerock',
      interface_proj = 'https://github.com/rnascunha/xerock_web',
      author_link = 'https://github.com/rnascunha',
      author = 'Rafael Cunha',
      year = 2021;

const html = `
<style>
    #about-modal
    {
        --my-modal-content-width: fit-content;
        --my-modal-content-height: fit-content;
        --my-modal-content-bg: #fcfcfc;
    }

    #about-content
    {
        padding: 20px;
        font-size: 1.3em;
    }

    h1
    {
        font-size: 2em;
        font-weight: bold;
        margin: 15px;
    }

    p
    {
        margin: 7px;
        padding: 2px;
    }

    .about-title
    {
        font-weight: bold;
        padding-bottom: 4px;
    }

    .about-link
    {
        padding: 5px;
        border-radius: 5px;
    }

    .about-link:hover
    {
        background-color: #eee;
    }

    .about-copyright{ margin-top: 30px; }
</style>

<div id=about-content>
    <h1>About Xerock</h1>
    <p>
        <div class=about-title>Website:</div>
        <div><a class=about-link target=_blank href=${website}>${website}</a></div>
    </p>
    <p>
        <div class=about-title>Daemon Project:</div>
        <div><a class=about-link target=_blank href=${daemon_proj}>${daemon_proj}</a></div>
    </p>
    <p>
        <div class=about-title>Interface project:</div>
        <div><a class=about-link target=_blank href=${interface_proj}>${interface_proj}</a></div>
    </p>
    <div class=about-copyright>Copyright \u00A9 ${year} <a target=_blank href=${author_link}>${author}</a></div> 
</div>
`;


export function About(icon)
{
    icon.addEventListener('click', ev => {
        let modal = document.createElement('my-modal');
        
        modal.id = 'about-modal';
        
        modal.addEventListener('close', ev => {
            modal.outerHTML = '';
        });
        
        modal.innerHTML = html;
        modal.show = true;
        
        document.body.appendChild(modal);
    });
}
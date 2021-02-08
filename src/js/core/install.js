
export function Install(container)
{
    let prompt  = null;
    
    window.addEventListener('beforeinstallprompt', ev => {
        container.textContent = `INSTALL`;
        container.style.display = 'inline-block';
        prompt = ev; 
        
        container.addEventListener('click', ev => {
            prompt.prompt();
//            prompt.userChoice.then(choice => {
//                if(choice.outcome === 'accepted') console.log('User accpeted install');
//                else console.log('User NOT accpeted install');
//            });
        });
    });
    
    window.addEventListener('appinstalled', ev => {
        container.style.display = 'none';
    });
}
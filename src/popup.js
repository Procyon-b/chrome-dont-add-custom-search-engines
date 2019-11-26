
chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    var host= tabs[0] && tabs[0].url && tabs[0].url.split('/')[2].split(':')[0];
    if (!host) {
        document.getElementById('noWL').classList.add('noWL');
        return;
        }

    var site=document.getElementById('host'), WLsite=document.getElementById('WLhost'), bg=chrome.extension.getBackgroundPage();
    site.innerHTML=host;
    WLsite.onclick=function(){
        bg.WL(host);
        window.close();
        return false;
        }

    var t=bg.noSpoil[host], wl;

    document.getElementById('dur').innerText=bg.expire/1000;
    if (!t) return;

    (wl=document.getElementById('inWL')).classList.add('inWL');
    var tl=document.getElementById('tl');

    // display current whitelist delay countdown
    var I=setInterval(function(){
        var d=t-Date.now();
        if (d>0) tl.innerText=Math.trunc(d/1000);
        else {
            clearInterval(I);
            wl.classList.remove('inWL');
            }
        }, 500);

    });

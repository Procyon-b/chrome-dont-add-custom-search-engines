"use strict";

var TA=document.getElementById('list'), btn=document.getElementById('btn'), def=document.getElementById('def'), bg=chrome.extension.getBackgroundPage();

TA.value=localStorage.sitesWMut;
def.value+=toStr(bg.defSitesWMut);
def.style.height=def.scrollHeight+4+'px';

// Convert array of values back to string.
function toStr(a) {
    var r='';
    for (let k in a) {
        r+=k;
        for (let e,i=0; e=a[k][i]; i++) {
            if (i==0) r+=' "'+e+'"';
            else r+=' '+e;
            }
        r+='\n';
        }
    return r;
}

// Validate current config using the background page function - save - and reload data
btn.onclick=function(){
    var s=bg.parseLst(TA.value).parsed;
    TA.value=s;
    localStorage.setItem('sitesWMut', s);
    bg.getStor();
    };

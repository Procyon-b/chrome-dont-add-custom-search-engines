"use strict";

var defSitesWMut={
    'www.nytimes.com': ['.css-10488qs'],
    'www.brico.be': ['.mxd-search-initial', 'pN', 'pN']
    };
var sitesWMut={};

var expire=90000, noSpoil={}, TO;

function parseRule(s) {
    var RErule=/^\s*([\w\-\.]+)\s*(.*)$/,
        REprm=/^(?:"(.+)"|([^"\s]\S*?))(?:\s+(\S.*))?\s*$/,
        REcmt=/^(\s*\/\/.*|\s*)$/;
    // is a comment or a blank line
    if (REcmt.test(s)) return;
    // match hostname (+ params)
    else if (RErule.test(s)) {
        var h=RegExp.$1, p=RegExp.$2, ar=[], j=20, raw=h;
        // get params (max 20)
        while (j-- && REprm.test(p)) {
            p=RegExp.$3;
            let v=RegExp.$1 || RegExp.$2;
            // 1st param is selectors
            if (j==19 && v!='null') raw+=' "'+v+'"';
            // test validity of other params
            else if (j<19 && !['parentNode','nextElementSibling','previousElementSibling','pN','nES','pES'].includes(v) ) continue;
            else raw+=' '+v;
            ar.push(v);
            }
        return {h,ar,raw};
        }
    // invalid rule
    return -1;
}

function parseLst(raw) {
    var v=raw.split('\n'), sites={}, err=[];
    for (let i=0; i<v.length; i++) {
        let r=parseRule(v[i]);
        // log error line #
        if (r<0) err.push(i);
        else if (r) {
            // clear rule
            if (r.ar[0]=='null') sites[r.h]=0;
            // add/update rule
            else sites[r.h]=r.ar;
            // update raw data with parsed value
            v[i]=r.raw;
            }
        }
    return {raw, err, sites, parsed:v.join('\n')};
}

function getStor() {
    var lst=parseLst(localStorage.sitesWMut || '').sites;
    sitesWMut=Object.assign({},defSitesWMut);
    for (var k in lst) {
        sitesWMut[k]=lst[k];
        }
}

getStor();

// hide whitelisted domain
function WL(h) {
    noSpoil[h]=Date.now()+expire;
    clrWL(1);
}

// clear whitelisted domains after "expire"
function clrWL(v) {
    var n, n0=0, now=Date.now();
    if (v && TO) clearTimeout(TO);
    TO=null;
    for (let k in noSpoil) {
        if ( (n=noSpoil[k]) < now) delete noSpoil[k];
        else if ( (n < n0) || (n0==0) ) n0=n;  // set nearest time-out
        }
    // prepare for next cleanup if needed
    if (n0) TO=setTimeout(clrWL, (n0-now)+1000);
}

// receive messages from contentscript
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (sender.id != chrome.runtime.id) return; // not from this extension
        if (request.host) {
            let s, r={};
            if (s=noSpoil[request.host]) r.noSpoil=s;
            else if (s=sitesWMut[request.host]) r.siteMut=s;
            sendResponse(r);
            }
    });

(function(e){define(["Distributor","Log","jquery"],function(t,n,r){var i={};return i.launch=function(){if(t.PERFORMANCE_TRACK){r(function(t){var r={event:"debug.fe.timing"},i;for(i in e.performance.timing)e.performance.timing.hasOwnProperty(i)&&(r[i]=e.performance.timing[i]);n(r)});var i=1,s=function(){var t={event:"debug.fe.memory",count:i},r;for(r in e.performance.memory)e.performance.memory.hasOwnProperty(r)&&(t[r]=e.performance.memory[r]);n(t),i++};s.call(this),setInterval(s,12e4)}},i})})(this);
(function(e,t){define(["Environment"],function(e){console.log("Distributor - File loaded. ");var t=parseInt(e.get("pcId").substring(e.get("pcId").length-2,e.get("pcId").length),16),n=function(e){return t/255<=e},r={PERFORMANCE_TRACK:.2},i={};return Object.defineProperties(i,{PERFORMANCE_TRACK:{get:function(){return n(r.PERFORMANCE_TRACK)}}}),i})})(this);
(function(e){define(["jquery","underscore","doT","Configuration","Environment","Internationalization","IO","Device","Log","utilities/StringUtil","ui/TemplateFactory","guide/views/CardView"],function(t,n,r,i,s,o,u,a,f,l,c,h){var p=h.getClass().extend({className:h.getClass().prototype.className+" w-guide-bind",template:r.template(c.get("guide","bind")),initialize:function(){this.listenTo(a,"change:deviceName",function(e,t){this.$(".stage .success p").html(l.format(o.welcome.GUIDE_BIND_DESC,e.get("deviceName")))})},checkAsync:function(){var e=t.Deferred(),n=function(t){u.requestAsync(i.actions.WINDOW_DEVICE_NEED_BIND).done(function(t){t.body.value?e.resolve(t):e.reject(t)}.bind(this)).fail(e.reject)};return a.get("isConnected")?n.call(this,a):this.listenToOnce(a,"change:isConnected",n),e.promise()},clickButtonAction:function(){u.requestAsync(i.actions.WINDOW_DEVICE_BIND),this.$(".stage .desc").remove(),this.$(".stage .success").css({display:"-webkit-box"}),this.$(".button-action").prop("disabled",!0),e.setTimeout(function(){this.trigger("next")}.bind(this),3e3),f({event:"ui.click.guide_bind_view_action"})}}),d=n.extend({getInstance:function(){return new p({action:o.welcome.GUIDE_BIND_NOW})}});return d})})(this);
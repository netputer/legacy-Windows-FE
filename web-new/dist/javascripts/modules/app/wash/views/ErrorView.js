(function(e,t){define(["backbone","doT","underscore","Device","ui/TemplateFactory","Log"],function(e,t,n,r,i,s){console.log("ErrorView - File loaded.");var o=e.View.extend({className:"w-app-wash-error",template:t.template(i.get("wash","wash-error")),render:function(){return this.$el.html(this.template({})),this},clickButtonRetry:function(){this.trigger("next"),this.remove(),s({event:"ui.click.wash.button.retry"})},events:{"click .button-retry":"clickButtonRetry"}}),u,a=n.extend({getInstance:function(){return new o}});return a})})(this);
(function(e){define(["jquery","underscore","doT","Internationalization","Log","ui/TemplateFactory","IO","guide/views/CardView"],function(e,t,n,r,i,s,o,u){var a=u.getClass().extend({className:u.getClass().prototype.className+" w-guide-tips",template:n.template(s.get("guide","tips")),tips:[{icon:"",desc:"保存自己的应用数据",url:""},{icon:"",desc:"保存自己的应用数据",url:""},{icon:"",desc:"保存自己的应用数据",url:""},{icon:"",desc:"保存自己的应用数据",url:""},{icon:"",desc:"保存自己的应用数据",url:""},{icon:"",desc:"保存自己的应用数据",url:""},{icon:"",desc:"保存自己的应用数据",url:""},{icon:"",desc:"保存自己的应用数据",url:""},{icon:"",desc:"保存自己的应用数据",url:""}],render:function(){return t.extend(this.events,a.__super__.events),this.delegateEvents(),this.$el.html(this.template({action:this.options.action,tips:this.tips})),this},clickButtonOpen:function(t){e(t.currentTarget).parent().addClass("text-thirdly")},events:{"click .button-open":"clickButtonOpen"}}),f=t.extend({getInstance:function(){return new a({action:r.welcome.GUIDE_TIPS_READ_ALL})}});return f})})(this);
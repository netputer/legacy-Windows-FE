(function(e,t){define(["backbone","underscore","doT","jquery","ui/Panel","ui/TemplateFactory","ui/SmartList","ui/BaseListItem","utilities/StringUtil","Device","Internationalization","Configuration","app/collections/AppsCollection"],function(e,n,r,i,s,o,u,a,f,l,c,h,p){console.log("FeedbackWindowView - File loaded. ");var d=e.View.extend({template:r.template(o.get("wash","wash-feedback")),className:"w-wash-feedback",render:function(){return this.$el.html(this.template({})),this},getReason:function(){return this.$('input[type="radio"]:checked').val()},getFeedbackType:function(){return parseInt(this.$('input[type="radio"]:checked').val(),10)},keyupInputReason:function(e){this.$('input[type="radio"]:last').val(e.originalEvent.srcElement.value)},clickLastRadio:function(){this.$(".input-reason").prop({disabled:!1}).focus()},clickNoneLastRadio:function(){this.$(".input-reason").prop({disabled:!0})},events:{'click input[type="radio"]:last':"clickLastRadio",'click input[type="radio"]:not(:last)':"clickNoneLastRadio","keyup .input-reason":"keyupInputReason"}}),v=a.extend({template:r.template(o.get("wash","wash-feedback-item")),className:"w-wash-feedback-app-list-item",render:function(){return this.$el.html(this.template(this.model.toJSON())),this}}),m=e.View.extend({className:"w-wash-feedback-app-list vbox",render:function(){return this.$el.empty(),this.listView=new u({itemView:v,dataSet:[{name:"default",getter:this.options.type===1&&this.options.ids.length>0?function(){return p.getInstance().filter(function(e){return this.options.ids.indexOf(e.id)>=0},this)}.bind(this):p.getInstance().getNormalApps}],keepSelect:!1,itemHeight:43,listenToCollection:p.getInstance()}),this.$el.append(this.listView.render().$el),this},getSelectedAppPackageName:function(){return this.$('input[type="radio"]:checked').val()},remove:function(){this.listView.remove(),m.__super__.remove.call(this)}}),g=[],y=e.View.extend({className:"w-wash-feedback",template:r.template(o.get("wash","wash-feedback-reason")),getTextAsync:function(){var e=i.Deferred();return g.length>0?e.resolve(g):i.ajax(h.actions.APP_WASH_GET_TEXT).done(function(t){g=t,e.resolve(t)}.bind(this)),e.promise()},render:function(){return this.getTextAsync().done(function(){this.$el.html(this.template({type:this.options.type,text:g}))}.bind(this)),this},getReason:function(){return this.$('input[type="radio"]:checked').val()},keyupInputReason:function(e){this.$('input[type="radio"]:last').val(e.originalEvent.srcElement.value)},clickLastRadio:function(){this.$(".input-reason").prop({disabled:!1}).focus()},clickNoneLastRadio:function(){this.$(".input-reason").prop({disabled:!0})},events:{'click input[type="radio"]:last':"clickLastRadio",'click input[type="radio"]:not(:last)':"clickNoneLastRadio","keyup .input-reason":"keyupInputReason"}}),b,w,E,S,x=s.extend({initialize:function(){x.__super__.initialize.apply(this,arguments),this.once("show",function(){b=new d,this.$bodyContent=b.render().$el;var e=this.buttons[0].$button.prop("disabled",!0);b.$('input[type="radio"]').on("click",function(t){b.getFeedbackType()!==1&&b.getFeedbackType()!==2?e.html("提交"):e.html("下一步"),e.prop("disabled",!1)}),S=1,this.once("remove",function(){b!==t&&b.remove(),w!==t&&w.remove(),E!==t&&E.remove(),b=t,w=t,E=t,this.off()})},this),this.on("next",function(){var e=this.buttons[0].$button.prop("disabled",!0);if(S===1)b.getFeedbackType()===1||b.getFeedbackType()===2?(w=new m({type:b.getFeedbackType(),ids:this.options.ids||[]}),this.$bodyContent=w.render().$el,setTimeout(function(){var t=function(){e.prop("disabled",!1),w.$el.undelegate('input[type="radio"]',"click",t)};w.$el.delegate('input[type="radio"]',"click",t)}.bind(this),0),this.title="选择有问题的应用",S=2):b.$(".input-reason").val().trim()!==""&&this.trigger("submit");else{E=new y({type:b.getFeedbackType()}),this.$bodyContent=E.render().$el,this.buttons=[{$button:i("<button>").html("提交").addClass("primary"),eventName:"submit"},{$button:i("<button>").html(c.ui.CANCEL),eventName:"button_cancel"}],e=this.buttons[0].$button.prop("disabled",!0);var t=function(){e.prop("disabled",!1),E.$el.undelegate('input[type="radio"]',"click",t)};E.$el.delegate('input[type="radio"]',"click",t),this.title=b.getFeedbackType()===1?"为什么洗错了":"为什么洗漏了",S=3}},this),this.once("submit",function(){var e=b.getFeedbackType()||0,t=w?w.getSelectedAppPackageName()||"":"",n=E?E.getReason():b.getReason(),r=t&&p.getInstance().get(t);i.ajax({type:"POST",url:h.actions.APP_WASH_FEEDBACK,data:{udid:l.get("udid")||"",from:"windows","package":t,md5:t?r.get("fileMd5")||r.get("base_info").md5:"",type:e===1?"wrong":e===2?"missing":"other",reason:n}}),this.remove()},this)}}),T=n.extend({getInstance:function(e){return new x(n.extend({title:"发生什么问题了？",height:250,buttons:[{$button:i("<button>").html("下一步").addClass("primary"),eventName:"next"},{$button:i("<button>").html(c.ui.CANCEL),eventName:"button_cancel"}]},e))}});return T})})();
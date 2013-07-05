(function(e,t){define(["jquery","backbone","underscore","doT","Internationalization","Log","ui/TemplateFactory","ui/PopupTip","IO","Device","Configuration","utilities/StringUtil","guide/views/CardView","app/collections/AppsCollection","task/TaskService"],function(e,n,r,i,s,o,u,a,f,l,c,h,p,d,v){var m=p.getClass().extend({className:p.getClass().prototype.className+" w-guide-starter",template:i.template(u.get("guide","starter")),loadAppsAsync:function(){var t=e.Deferred();return f.requestAsync({url:c.actions.APP_STARTER,success:function(e){this.queryResults=e,t.resolve()}.bind(this),error:t.reject}),t.promise()},apps:[],checkAppsAsync:function(){var t=e.Deferred(),n=d.getInstance(),r=function(e){!e.syncing&&!e.loading&&l.get("isConnected")&&(this.stopListening(e,"refresh",r),t.resolve())};return!n.syncing&&!n.loading&&l.get("isConnected")?setTimeout(t.resolve):(this.listenTo(n,"refresh",r),n.trigger("update")),t.promise()},checkAsync:function(){var n=e.Deferred();return e.when(this.loadAppsAsync(),this.checkAppsAsync()).done(function(){var e=d.getInstance(),r,i=this.queryResults[0].apps.length,s;for(r=0;r<i;r++){s=this.queryResults[0].apps[r],e.get(s.packageName)===t&&this.apps.push(s);if(this.apps.length===8)break}i=this.queryResults[1].apps.length;for(r=0;r<i;r++){s=this.queryResults[1].apps[r],e.get(s.packageName)===t&&this.apps.push(s);if(this.apps.length===12)break}o({event:"debug.guide_starter_show"}),n.resolve()}.bind(this)).fail(n.reject),n.promise()},render:function(){return r.extend(this.events,m.__super__.events),this.delegateEvents(),this.$el.html(this.template({action:this.options.action,apps:this.apps})),this.$("[data-title]").each(function(){var t=new a({$host:e(this)})}),this},clickButtonInstall:function(t){var r=e(t.currentTarget),i=new n.Model({source:"starter",downloadUrl:decodeURIComponent(r.data("url")),title:r.data("name"),iconPath:r.data("icon")});v.addTask(c.enums.TASK_TYPE_INSTALL,c.enums.MODEL_TYPE_APPLICATION,i),o({event:"ui.click.guide_starter_install"})},clickButtonSkip:function(){m.__super__.clickButtonSkip.call(this),o({event:"ui.click.guide_starter_skip"})},clickButtonAction:function(){var e=r.map(this.apps,function(e){return{downloadUrl:e.apks[0].downloadUrl.url,title:e.title,iconSrc:e.icons.px68,versionName:e.apks[0].versionName,versionCode:e.apks[0].versionCode,size:e.apks[0].bytes,packageName:e.apks[0].packageName}},this);v.batchDownloadAsync(e,"starter-one-key-install"),this.trigger("next"),o({event:"ui.click.guide_starter_install_all"})},events:{"click .button-install":"clickButtonInstall"}}),g=r.extend({getInstance:function(){return new m({action:s.welcome.GUIDE_STARTER_INSTALL_ALL})}});return g})})(this);
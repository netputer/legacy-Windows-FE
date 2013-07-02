(function(e,t){define(["backbone","underscore","doT","jquery","ui/TemplateFactory","Log","app/wash/views/IntroView","app/wash/views/ScanningView","app/wash/views/ScanResultView","app/wash/views/ScanFinishView","app/wash/views/ErrorView","main/collections/PIMCollection"],function(e,t,n,r,i,s,o,u,a,f,l,c){console.log("AppWashModuleView - File loaded.");var h=e.View.extend({className:"w-app-wash-module-main module-main",initialize:function(){var e=!1;Object.defineProperties(this,{rendered:{set:function(t){e=t},get:function(){return e}}})},render:function(){return this.introView=o.getInstance(),this.listenTo(this.introView,"next",this.renderScanningView),this.$el.prepend(this.introView.render().$el),this.rendered=!0,this},renderScanningView:function(){this.introView&&(this.introView.remove(),this.stopListening(this.introView,"next"),delete this.introView),this.scanningView=u.getInstance(),this.listenTo(this.scanningView,"next",this.renderScanResultView),this.listenTo(this.scanningView,"error",this.renderErrorView),this.$el.prepend(this.scanningView.render().$el),this.scanningView.startQueryMD5()},renderErrorView:function(){this.scanningView&&(this.scanningView.remove(),this.stopListening(this.scanningView,"next error"),delete this.scanningView),this.errorView=l.getInstance().render(),this.listenTo(this.errorView,"next",this.reset),this.$el.prepend(this.errorView.$el)},renderScanResultView:function(e){this.scanningView&&(this.scanningView.remove(),this.stopListening(this.scanningView,"next error"),delete this.scanningView),e.length>0?(this.scanResultView=a.getInstance(),this.scanResultView.renderItems(e),this.listenTo(this.scanResultView,"next",this.renderScanFinishView),this.$el.prepend(this.scanResultView.$el)):this.renderScanFinishView()},renderScanFinishView:function(){this.scanResultView&&(this.scanResultView.remove(),this.stopListening(this.scanResultView,"next"),delete this.scanResultView),this.scanFinishView=f.getInstance(),this.scanFinishView.switchToEmptyView(),this.listenTo(this.scanFinishView,"next",this.reset),this.$el.prepend(this.scanFinishView.$el)},deleteAllSubView:function(){this.introView&&(this.introView.remove(),this.stopListening(this.introView,"next"),delete this.introView),this.scanningView&&(this.scanningView.remove(),this.stopListening(this.scanningView,"next error"),delete this.scanningView),this.scanResultView&&(this.scanResultView.remove(),this.stopListening(this.scanResultView,"next"),delete this.scanResultView),this.scanFinishView&&(this.scanFinishView.remove(),this.stopListening(this.scanFinishView,"next"),delete this.scanFinishView),this.errorView&&(this.errorView.remove(),this.stopListening(this.errorView,"next"),delete this.errorView)},remove:function(){this.deleteAllSubView(),h.__super__.remove.call(this)},reset:function(){this.deleteAllSubView(),this.render()},events:{"click .button-restart":"reset"}}),p,d=t.extend({enablePreload:!1,getInstance:function(){return p||(p=new h),p},navigate:function(){c.getInstance().get(19).set({selected:!0})}});return d})})(this,this.document);
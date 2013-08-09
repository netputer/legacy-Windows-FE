require(['ui/SmartList'], function(SmartList) {
    module('SmartList');
        
    test('Data set test.', 12, function() {
        var models1 = [{
                    id : 1
                }, {
                    id : 2
                }, {
                    id : 3
                }, {
                    id : 4
                }, {
                    id : 5
                }];
        var models2 = [{
                    id : 3
                }, {
                    id : 4
                }, {
                    id : 5
                }, {
                    id : 6
                }, {
                    id : 7
                }];
        var models3 = [{
                    id : 5
                }, {
                    id : 6
                }, {
                    id : 7
                }, {
                    id : 8
                }, {
                    id : 9
                }];
                
        var collection1 = new Backbone.Collection(models1);
        var collection2 = new Backbone.Collection(models2);
        var collection3 = new Backbone.Collection(models3);

        var smartList = new SmartList({
            itemView : Backbone.View.extend({selectItem:function(){},deselectItem:function(){}}),
            dataSet : [{
                name : 'default',
                models : collection1.models
            }],
            keepSelect : true
        });
        
        $('body').append(smartList.render().$el.hide());        
        
        equal(smartList.currentSet.name, 'default', 'Default data set name OK.');
        
        smartList.switchSet('collection2', collection2.models);
        
        equal(smartList.currentSet.name, 'collection2', 'Collection2 data set name OK.');
        
        smartList.switchSet('collection3', collection3.models);
        
        equal(smartList.currentSet.name, 'collection3', 'Collection3 data set name OK.');

        smartList.switchSet('collection2');

        equal(smartList.currentSet.name, 'collection2', 'Data set switch OK.');
        equal(smartList.currentModels, collection2.models, 'Data set models switch OK.');

        smartList.switchSet('default');
        smartList.addSelect(1);
        smartList.addSelect(2);
        smartList.addSelect(3);

        ok(_.isEqual(smartList.selected, [1, 2, 3]), 'Select itemes OK.');

        smartList.removeSelect(2);

        ok(_.isEqual(smartList.selected, [1, 3]), 'Deselect itemes OK.');

        smartList.switchSet('collection2');

        ok(_.isEqual(smartList.selected, [3]), 'Keep selected itemes OK.');

        smartList.removeSelect(3);

        ok(_.isEqual(smartList.selected, []), 'Deselect itemes OK.');

        smartList.switchSet('default');

        ok(_.isEqual(smartList.selected, [1]), 'Deselect itemes OK.');

        smartList.switchSet('collection3');

        ok(_.isEqual(smartList.selected, []), 'Switch set itemes OK.');
        smartList.addSelect(5);
        smartList.addSelect(6);
        smartList.addSelect(7);
        smartList.switchSet('collection2');

        ok(_.isEqual(smartList.selected, [5, 6, 7]), 'Switch set itemes OK.');

    });
});
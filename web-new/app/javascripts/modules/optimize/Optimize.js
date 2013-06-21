(function(window, undefined) {
    define(['optimize/views/OptimizeModuleView'], function(OptimizeModuleView) {
        var Optimize = {
            OptimizeModuleView : OptimizeModuleView
        };

        window.Optimize = Optimize;

        return Optimize;
    });
})(this);
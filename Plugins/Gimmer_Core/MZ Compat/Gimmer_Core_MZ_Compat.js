Game_Interpreter.prototype.setupReservedCommonEvent = function() {
    if ($gameTemp.isCommonEventReserved()) {
        const commonEvent = $gameTemp.retrieveCommonEvent();
        if (commonEvent) {
            this.setup(commonEvent.list, 0, commonEvent.id);
            return true;
        }
    }
    return false;
};

Window.prototype.standardPadding = function(){
    return this._padding;
}
(function (window, document) {
    var baseSelector = '[data-itemScope]';
    var dataAttributes = { prop: 'data-itemProp', ref: 'data-itemRef', scope: 'data-itemScope', type: 'data-itemType'};

    var valueGetters = {
        meta: function() { return getAttribute(this, 'content') || ''; },
        audio: getSrc, embed: getSrc, iframe: getSrc, img: getSrc, source: getSrc, track: getSrc, video: getSrc,
        a: getHref, area: getHref, link: getHref,
        data: getValue, meter: getValue,
        time: function () {
            var time, timeStr = this.textContent;
            try { time = new Date(timeStr); } catch(e) { time = null; }

            return time;
        }

    };

    function getSrc() { return getAttribute(this, 'src'); }
    function getHref() { return getAttribute(this, 'href'); }
    function getValue() { return getAttribute(this, 'value') || ''; }

    function getAll(element, selector){
        return element.querySelectorAll(selector);
    }

    function getAttribute(element, attribute){
        return element.getAttribute(attribute);
    }

    /**
     *
     * @param element {HTMLElement}
     */
    function getItemValue(element){
        if(valueGetters[element.tagName])
            return valueGetters[element.tagName].call(element);

        return element.textContent || element.innerText;
    }

    /**
     *
     * @param element {HTMLElement}
     * @param parsedItems {[HTMLElement]}
     */
    function loadValuesAndPropertiesFromChildren(element, parsedItems){
        var properties = {};

        for (var i = 0; i < element.children.length; i++){
            var childElement = element.children[i];

            var propertyName = getAttribute(childElement, dataAttributes.prop);
            if (propertyName) {
                if(getAttribute(childElement, dataAttributes.scope)){

                    if (!(childElement in parsedItems)) { // performing check to avoid multiple item parsing

                        childElement.itemValue = loadValuesAndProperties(childElement, parsedItems);
                        parsedItems.push(childElement);
                    }
                }
                else {
                    childElement.itemValue = getItemValue(childElement);
                    childElement['properties'] = [];
                }

                if (properties[propertyName])
                    properties[propertyName].push(childElement.itemValue);
                else
                    properties[propertyName] = [childElement.itemValue];
            }
        }

        element['properties'] = properties;

        return properties;
    }

    var loadValuesAndProperties = loadValuesAndPropertiesFromChildren;

    /**
     * returns elements with items
     * @param elementSelector {string|HTMLElement}
     */
    window.getItems = function(elementSelector) {
        var element = typeof elementSelector == 'string' ? document.querySelector(elementSelector) : elementSelector;

        var types = [];
        for(var i = 1; i < arguments.length; i++){
            var arg = arguments[i];
            if(typeof arg == 'string') types.push(arg);
        }

        var selector;
        if (types.length > 0) {
            selector = '';
            for (var j = 0; j < types.length; j++) {
                if (j > 0) selector += ', ';

                selector += baseSelector + '[data-itemType=\'' + types[j] + '\']';
            }
        }
        else selector = baseSelector;

        var selectedElements = getAll(element, selector);

        for(i = 0; i < selectedElements.length; i++){
            var element = selectedElements[i];

            // loading properties and values
            loadValuesAndProperties(element);
        }

        return selectedElements;
    }

})(window, document);

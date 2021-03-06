function TemplateCompiler() {
    'use strict';
    var fn = {};

    var escapingMap = {
        "\\": "\\\\",
        "\n": "\\n",
        "\r": "\\r",
        "\u2028": "\\u2028",
        "\u2029": "\\u2029",
        "'": "\\'"
    };

    var entitiesMap = {
        '&': '&amp;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;'
    };

    var commandsMap = {
        '{else}': "';} else { out+='",
        '{end}':  "';} out+='",
        '&amp;': '&',
        '&quot;': '"',
        '&lt;': '<',
        '&gt;': '>'
    };

    // Render a template with data
    this.compile = function (template) {
        if (!template) return '';

        fn[template] = fn[template] || new Function("_", "entitiesMap",
            "var out='" +
                (template
                    .replace(/(&lt\;|&gt\;|&amp\;|&quot\;|\{else\}|\{end\})/g, function(token) { return commandsMap[token]; })
                    .replace(/{var\s+([^\{\}]+)\s*}/g, "'; var $1; out+='")
                    .replace(/\{(\w+)\s+([^\{\}]+)\}/g, "'; $1($2) { out+='")
                    .replace(/\{:\s*([^\{\}]+)\s*\}/g, "'+$1+'")
                    .replace(/\{\s*(\w+)\s*\}/g, "'+(_.$1?(_.$1+'').replace(/[&\"<>]/g,function(e){return entitiesMap[e];}):(_.$1===0?0:''))+'") +
                "';return out;")
                    .replace(/(\n)+\s*/g, '')
                    .replace(/ out\+='';/g, '')
        );

        return fn[template];
    };

    this.render = function (template, data) {
        return this.compile(template)(data, entitiesMap);
    };

    return this;
}

function temp() {
//var out = ''; for(var i = 0; i < _.length; i++) { out+='' + var item = _[i];  + '<p id="item-' + i + '">' + item.name + ': ' + item.value + '</p>';} return out;
}
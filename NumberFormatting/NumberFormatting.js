(function () {
    Number.prototype.validateFormat = function (format) {
        if (format.length === 0) {
            console.error('empty format string');
            return false;
        }

        var delimeterFound = false,
            nowOnPrefix = true,
            nowOnSuffix = false;

        for (var index = 0; index < format.length; index++) {
            var currentChar = format.charAt(index);
            switch (currentChar) {
                case '.':
                    if (delimeterFound) {
                        console.error('format string [' + format + '] contains more than one delimeter (position: ' + index + ').');
                        return false;
                    }
                    else {
                        delimeterFound = true;
                        if (nowOnPrefix) {
                            nowOnPrefix = false;
                        }
                        //else if (nowOnSuffix){
                        //    console.error('format string[' + format + '] contains delimeter on suffix (position: ' + index + ').');
                        //}
                    }
                    break;
                case '0':
                case '#':
                    if (nowOnPrefix && !nowOnSuffix) {
                        nowOnPrefix = false;
                    }
                    else if (nowOnSuffix) {
                        console.error('format string[' + format + '] contains special symbol \'' + currentChar + '\' on suffix (position: ' + index + ').');
                        return false;
                    }
                    break;
                default:
                    if (!nowOnPrefix && !nowOnSuffix) {
                        nowOnSuffix = true;
                    }
            }
        }

        return true;
    };

    Number.prototype.toFormattedString = function(format, separator) {
        var number = this;

        format = format || '0.##';
        separator = separator || '.';

        var prefixLength = 0,
            suffixLength = 0,
            minFractionLength = 0,
            maxFractionLength = 0,
            minIntegralLength = 0,
            maxIntegralLength = 0;

        var currentBlock = 0; // 0 - prefix, 1 - integral part, 3 - fraction part, 4 - suffix

        // calculating blocks length
        for (var index = 0; index < format.length; index++) {
            var currentChar = format.charAt(index);
            if (currentChar == '.') {
                currentBlock = 3;
                continue;
            }

            switch (currentChar) {
            case '#':
                switch (currentBlock) {
                case 0:
                    currentBlock = 1; // we are step into integral block now
                case 1:
                    maxIntegralLength++; // we are in integral block
                    break;
                case 3:
                    maxFractionLength++; // we are in fraction block
                    break;
                }
                break;
            case '0':
                switch (currentBlock) {
                case 0:
                    currentBlock = 1; // we are step into integral block now
                case 1:
                    minIntegralLength++; // we are in integral block
                    maxIntegralLength++;
                    break;
                case 3:
                    minFractionLength++; // we are in fraction block
                    maxFractionLength++;
                    break;
                }
                break;
            /*case '.':
                        switch (currentBlock) {
                            case 0:
                            case 1:
                                currentBlock = 3; // we are stepping into fraction block now
                                break;
                        }
                        break;*/
            default:
                switch (currentBlock) {
                case 0:
                    prefixLength++; // we are in prefix block now
                    break;
                case 3:
                    currentBlock = 4; // we are stepping into suffix block now
                case 4:
                    suffixLength++; // we are into suffix block now
                    break;
                }
            }
        }

        // getting raw string representation of number
        var tokens = number.toString().split('.');
        var result = '';

        // getting prefix
        if (prefixLength > 0) {
            result += format.substr(0, prefixLength);
        }

        if (number < 0) {
            result += '-';
            tokens[0] = tokens[0].substr(1);
        }

        // calculating integral part
        // we have special case when number in between (-1; 1) which can be treated specially in case on '.0' or '.#' format
        if (number > -1.0 && number < 1.0 && minIntegralLength === 0) {
            tokens[0] = '';
        } else {
            if (tokens[0].length === minIntegralLength || tokens[0].length > maxIntegralLength) {
                result += tokens[0];
            } else if (tokens[0].length < minIntegralLength) {
                result += Array(minIntegralLength + 1 - tokens[0].length).join('0') + tokens[0];
            } else if (tokens[0].length < maxIntegralLength) {
                result += Array(maxIntegralLength + 1 - tokens[0].length).join('0') + tokens[0];
            }
        }

        // getting separator
        if (maxFractionLength > 0) { // do nothing because we shouldn't have fraction part in a resulted value
            var fLength = tokens.length > 1 ? tokens[1].length : 0;
            if (minFractionLength > 0 || fLength > 0) {
                result += separator;
                if (fLength <= minFractionLength) {
                    result += number.toFixed(minFractionLength).split('.')[1]; // using toFixed to avoid creating custom rounding code
                } else {
                    result += number.toFixed(maxFractionLength).split('.')[1];
                }
            }
        }

        // getting suffix
        if (suffixLength > 0) {
            result += format.substr(-suffixLength);
        }

        return result;
    };
})();
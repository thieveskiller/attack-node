const random = require("string-random");

const funs = {
    qq: () => {
        return random(10, { letters: false });
    },
    phone: () => {
        return random(11, { letters: false });
    },
    number: (len) => {
        return random(len, { letters: false });
    },
    string: (len) => {
        return random(len);
    },
    custom: (str,len) => {
        return random(len, {specials: str, numbers: false, letters: false});
    }
}

module.exports = funs
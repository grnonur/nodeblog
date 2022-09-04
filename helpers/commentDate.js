const moment = require('moment');

module.exports = {
    commentDate: date => {
        return moment(date).fromNow();
    }
}
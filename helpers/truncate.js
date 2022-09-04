module.exports = {
    truncate: (str, limit) => {
        if(str.length > limit){
            str = str.substring(0, limit) + '...';
        }
        return str;
    }
}
module.exports = {
    countComment: arr => {
        if(!Array.isArray(arr)){
            return 0;
        }
        return arr.length;
    }
}
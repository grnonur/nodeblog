module.exports = {
    commentAuth: (userid, authorid) => {
        if(userid == authorid){
            return true;
        }
        else{
            return false;
        }
    }
}
module.exports = {
    strip: str => {
        var regex = /(<([^>]+)>)/ig
        str = str.replace(regex, "");
        str = str.replace('&quot;&#39;',"'");
        return str.replace('&quot;', '"');
    }
}
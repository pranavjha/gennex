function map(doc) {
    //  summary:
    //      The configuration map function returns a list of configurations that can be filtered 
    //      by the user id and workspace layout name.
    //  returns:
    //      { key : String[] } { value : Object }
    //      - key: contains an array of configuration name, user email id and store id.
    //      - value: the corresponding configuration object
    if (doc.type == 'screen-configuration') {
        doc.value.forEach(function(item) {
            emit([
                item.configName,
                item.email,
                item._storeId
            ], item);
        });
    }
}
module.exports  = {
    truefalse: (type, value) => {
        if(type === 'auth'){
            if(value === true){
                return 'Yönetici'
            }
            else{
                return 'Kullanıcı'
            }
        }
        else if(type === 'banned'){
            if(value === true){
                return 'Yasaklı'
            }
            else{
                return 'Aktif'
            }
        }
        else if(type === 'verified'){
            if(value === true){
                return 'Doğrulanmış'
            }
            else{
                return 'Doğrulanmamış'
            }
        }
    }
}
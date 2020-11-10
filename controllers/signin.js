const handleSignIn = (req,res,db,bcrypt) => {
    db.select('email','hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        console.log(data)
        let isValid = false;
        if (data[0]){
            isValid = bcrypt.compareSync(req.body.password, data[0].hash)
            
            if(isValid){
                return db.select('*').from('users')
                .where('email', '=', req.body.email)
                .then(user => {
                
                    res.json(user[0])
                })
                .catch(err => res.json('unable to get data'))
            }else{
                res.json('do not match')
            }
        }else{
            res.json("do not match")
        }

    })

}
   
    
    
module.exports = {
    handleSignIn:handleSignIn
}
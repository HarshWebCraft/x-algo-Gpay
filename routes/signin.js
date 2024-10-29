
const User = require('../models/users')
const signin = async (req, res) => {


    const checking = await User.findOne({ Email: req.body.email });
    console.log(checking)


    if (checking) {

        if (checking.Verification) {


            if (checking.Password == req.body.pass) {
                console.log('signin successfully')
                res.json({ email: true, password: true, userSchema: checking, verification: true });
            }
            else {
                res.json({ email: true, password: false, verification: true });
            }
        }
        else
        {
            res.json({email:true,verification:false})
        }
    }
    else {
        res.json({ email: false });
    }


}

module.exports = signin
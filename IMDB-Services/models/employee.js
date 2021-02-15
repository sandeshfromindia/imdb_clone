const mongoose = require('mongoose');
const crypto = require('crypto');
const { v1: uuidv1 }= require('uuid');


const employeeSchema = new mongoose.Schema({
    first_name: {
        type : String,
        trim: true,
        required: true,
        maxlength: 32
    },
    last_name: {
        type : String,
        trim: true,
        required: true,
        maxlength: 32
    },
    email: {
        type : String,
        trim: true,
        required: true,
        unique: true
    },
    hashed_password : {
        type : String,
        required: true,
    },
    employee_id: {
        type : String,
        trim: true,
        unique: true
    },
    organization_name: {
        type : String,
        trim: true,
    },
    salt: String,
}, {timestamps: true});

//virtual field

employeeSchema.virtual('password')
    .set(function (password){
        this._password = password;
        this.salt = uuidv1();
        this.hashed_password = this.encryptPassword(password)
    })
    .get(function (){
        return this._password;
    });

employeeSchema.methods = {
    authenticate : function (plainText){
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    encryptPassword : function (password){
        if (!password) return '';
        try{
            return crypto.createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        }catch (err){
            return '';
        }
    }
}



module.exports = mongoose.model('Employee', employeeSchema);

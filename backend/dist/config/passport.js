"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// /src/config/passport.ts
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const user_model_1 = require("../models/user.model");
const auth_1 = require("../utils/auth");
passport_1.default.use(new passport_local_1.Strategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await user_model_1.User.findOne({ where: { email } });
        if (!user)
            return done(null, false, { message: 'Email não encontrado' });
        const isValid = await (0, auth_1.comparePassword)(password, user.password);
        if (!isValid)
            return done(null, false, { message: 'Senha incorreta' });
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await user_model_1.User.findByPk(id);
        done(null, user);
    }
    catch (error) {
        done(error);
    }
});
exports.default = passport_1.default;

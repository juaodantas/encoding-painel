// /src/config/passport.ts
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from '../models/user.model';
import { comparePassword } from '../utils/auth';

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email: string, password: string, done: any) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) return done(null, false, { message: 'Email não encontrado' });
        
        const isValid = await comparePassword(password, user.password);
        if (!isValid) return done(null, false, { message: 'Senha incorreta' });
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
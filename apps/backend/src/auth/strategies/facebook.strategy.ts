import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private configService: ConfigService;

  constructor(configService: ConfigService) {
    // super() must be the first statement - compute values inline
    const clientID = configService.get('FACEBOOK_APP_ID');
    const clientSecret = configService.get('FACEBOOK_APP_SECRET');
    const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
    const useDummy = !clientID || !clientSecret || clientID === 'your_facebook_app_id';

    super({
      clientID: useDummy ? 'dummy-app-id-for-startup' : clientID,
      clientSecret: useDummy ? 'dummy-app-secret-for-startup' : clientSecret,
      callbackURL: `${frontendUrl}/api/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'name'],
    });

    this.configService = configService;
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
    };
    done(null, user);
  }
}

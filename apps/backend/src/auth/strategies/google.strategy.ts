import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private configService: ConfigService;

  constructor(configService: ConfigService) {
    // super() must be the first statement - compute values inline
    const clientID = configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');
    const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
    const useDummy = !clientID || !clientSecret || clientID === 'your_google_client_id';

    super({
      clientID: useDummy ? 'dummy-client-id-for-startup' : clientID,
      clientSecret: useDummy ? 'dummy-client-secret-for-startup' : clientSecret,
      callbackURL: `${frontendUrl}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });

    this.configService = configService;
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}

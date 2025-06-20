import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jtwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'zD87s9fhsd8fyshdfsdyf@#jksdf908sdjfhsdjf',
      signOptions: { expiresIn: '5s' },
      //  1h si dans une heure
    }),
  ],
  exports:[JwtAuthGuard, JwtAuthGuard],
  controllers: [AuthController,AuthController],
  providers: [JwtStrategy, JwtAuthGuard],
})
export class AuthModule {}

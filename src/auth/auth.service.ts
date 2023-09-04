import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) { }
  async signup(dto: AuthDto):
    Promise<{ accessToken: string }> {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash
        },
      });

      const token = await this.signToken(user.id, user.email)
      return {
        accessToken: token
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Credntials taken")
        }
      }
      throw error
    }
  }

  async signin(dto: AuthDto):
    Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new ForbiddenException("Credenial Incorrect");

    const pwMatches = await argon.verify(user.hash, dto.password);
    if (!pwMatches) throw new ForbiddenException("Credenial Incorrect");
    const token = await this.signToken(user.id, user.email)
    return {
      accessToken: token
    }
  }

  signToken(userId: number, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email
    }
    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get("JWT_SECRET")
    })
  }
}
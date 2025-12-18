import { sign, verify, JwtPayload } from "jsonwebtoken";
import { compare, hash } from "bcryptjs";
import * as admin from "firebase-admin";
import { BadRequestError } from "../middlewares/error.middleware";
import { config } from "../config/env.config";
import {
  IAuthenticateRequest,
  IAuthResponse,
  ICreateUserRequest,
  IRefreshTokenRequest,
  ITokenPayload,
  UserData,
} from "../types";

type TokenData = {
  token: string;
  createdAt: number;
  isActive: boolean;
};

class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutos
  private readonly REFRESH_TOKEN_EXPIRY = "7d"; // 7 dias
  private readonly SECRET_KEY = config.jwt.secretKey;
  private readonly REFRESH_SECRET_KEY = config.jwt.refreshSecretKey;

  async authenticate({
    email,
    senha,
  }: IAuthenticateRequest): Promise<IAuthResponse> {
    try {
      // Authenticate user using Firebase Admin
      const userRecord = await admin.auth().getUserByEmail(email);
      if (!userRecord) {
        throw new BadRequestError({
          code: 404,
          message: "Usuario nao encontrado",
          logging: true,
        });
      }

      // Find user in the database using user ID
      const userId = userRecord.uid;
      const userRef = admin.database().ref(`gma/users/${userId}`);
      const snapshot = await userRef.once("value");

      if (!snapshot.exists()) {
        throw new BadRequestError({
          code: 404,
          message: "Usuario nao encontrado",
          logging: true,
        });
      }

      const userData = snapshot.val();

      // Verify password
      const isPasswordValid = await compare(senha, userData.password);
      if (!isPasswordValid) {
        throw new BadRequestError({
          code: 401,
          message: "Senha incorreta",
          logging: true,
        });
      }

      const fcmToken = await admin.auth().createCustomToken(userId);

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens({
        id: userId,
        email,
        nome: userData.nome,
        role: userData.role,
      });

      // Store refresh token in database (opcional, para invalidação)
      await this.storeRefreshToken(userId, refreshToken);

      const { password, ...userWithNoPassword } = userData;

      return {
        user: { ...userWithNoPassword },
        accessToken,
        refreshToken,
        fcmToken,
      };
    } catch (error: any) {
      throw new BadRequestError({
        code: 500,
        message: `Erro ao autenticar o usuario: ${error.message}`,
        logging: true,
      });
    }
  }

  async refreshToken({ refreshToken }: IRefreshTokenRequest): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Verify refresh token
      const decoded = verify(
        refreshToken,
        this.REFRESH_SECRET_KEY
      ) as JwtPayload & ITokenPayload;

      if (decoded.type !== "refresh") {
        throw new BadRequestError({
          code: 401,
          message: "Token invalido",
          logging: true,
        });
      }

      // Invalidar o refresh token usado
      // await blacklistToken(refreshToken);

      // Verify if refresh token exists in database (opcional)
      const isValidRefreshToken = await this.validateRefreshToken(
        decoded.id,
        refreshToken
      );
      if (!isValidRefreshToken) {
        throw new BadRequestError({
          code: 401,
          message: "Refresh token invalido ou expirado",
          logging: true,
        });
      }

      // Get updated user data
      const userRef = admin.database().ref(`gma/users/${decoded.id}`);
      const snapshot = await userRef.once("value");

      if (!snapshot.exists()) {
        throw new BadRequestError({
          code: 404,
          message: "Usuario nao encontrado",
          logging: true,
        });
      }

      const userData = snapshot.val();

      // Generate new tokens
      const tokens = this.generateTokens({
        id: decoded.id,
        email: decoded.email,
        nome: userData.nome,
        role: userData.role,
      });

      // Update refresh token in database
      await this.storeRefreshToken(decoded.id, tokens.refreshToken);

      // Invalidate old refresh token (opcional)
      await this.invalidateRefreshToken(decoded.id, refreshToken);

      return tokens;
    } catch (error: any) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        throw new BadRequestError({
          code: 401,
          message: "Refresh token invalido ou expirado",
          logging: true,
        });
      }
      throw new BadRequestError({
        code: 500,
        message: `Error refreshing token: ${error.message}`,
        logging: true,
      });
    }
  }

  async createUser(data: ICreateUserRequest): Promise<{ message: string }> {
    const { email, senha, nome, matricula, role, cpf } = data;

    try {
      //verificar se o usuario existe
      const usersRef = admin.database().ref("gma/users");
      const snapshot = await usersRef
        .orderByChild("cpf")
        .equalTo(cpf)
        .once("value");
      const usersObj = snapshot.val();
      console.log("usersObj:", usersObj);
      if (usersObj) {
        throw new BadRequestError({
          code: 400,
          message: "CPF já cadastrado",
          logging: true,
        });
      }

      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password: senha,
      });

      // Save user data in the database
      const userId = userRecord.uid;
      const userRef = admin.database().ref(`gma/users/${userId}`);
      await userRef.set({
        id: userId,
        nome,
        cpf,
        password: await hash(senha, 8), // Store hashed password
        matricula,
        email,
        role,
        createdAt: admin.database.ServerValue.TIMESTAMP,
      });

      return { message: "Usuario criado com sucesso" };
    } catch (error: any) {
      if (error.code === "app/invalid-credential") {
        throw new BadRequestError({
          code: 400,
          message: "Erro nas credenciais",
          logging: true,
        });
      }
      if (error.code === "auth/email-already-exists") {
        throw new BadRequestError({
          code: 400,
          message: "Email já cadastrado",
          logging: true,
        });
      }
      throw new BadRequestError({
        code: 500,
        message: `Error creating user: ${error.message}`,
        logging: true,
      });
    }
  }

  async updateUser(
    userId: string,
    userData: Partial<{
      id: string;
      nome: string;
      password: string;
      matricula: string;
      email: string;
      role: string;
      avatarUrl: string;
      fcmToken: string;
    }>
  ): Promise<any> {
    try {
      // Update user in Firebase Auth if email or password is provided
      const updateAuthData: any = {};
      console.log("userData:", userData);

      if (userData.email) updateAuthData.email = userData.email;
      if (userData.password) updateAuthData.password = userData.password;
      if (Object.keys(updateAuthData).length > 0) {
        await admin.auth().updateUser(userId, updateAuthData);
      }
      const userRef = admin.database().ref(`gma/users/${userId}`);
      const snapshot = await userRef.once("value");

      if (!snapshot.exists()) {
        throw new BadRequestError({
          code: 404,
          message: "Usuario nao encontrado",
          logging: true,
        });
      }

      // Update user data
      await userRef.update(userData);

      // Return updated user data without password
      const updatedUser = { ...snapshot.val(), ...userData };
      const { password, ...userWithNoPassword } = updatedUser;

      return userWithNoPassword;
    } catch (error: any) {
      throw new BadRequestError({
        code: 500,
        message: `Error updating user: ${error.message}`,
        logging: true,
      });
    }
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
    try {
      const userRef = admin.database().ref(`gma/users/${userId}`);
      const snapshot = await userRef.once("value");

      if (!snapshot.exists()) {
        throw new BadRequestError({
          code: 404,
          message: "Usuario nao encontrado",
          logging: true,
        });
      }

      const { role } = snapshot.val();

      const fcmTokenRef = admin.database().ref(`gma/fcmtokens/${userId}`);
      await fcmTokenRef.set({
        token: fcmToken,
        role,
        createdAt: admin.database.ServerValue.TIMESTAMP,
      });
    } catch (error: any) {
      throw new BadRequestError({
        code: 500,
        message: `Error updating FCM token: ${error.message}`,
        logging: true,
      });
    }
  }

  async getUserById(userId: string): Promise<Omit<UserData, "password">> {
    try {
      const userRef = admin.database().ref(`gma/users/${userId}`);
      const snapshot = await userRef.once("value");

      if (!snapshot.exists()) {
        throw new BadRequestError({
          code: 404,
          message: "Usuario nao encontrado",
          logging: true,
        });
      }

      const userData: UserData = snapshot.val();
      const { password, ...userWithNoPassword } = userData;

      return userWithNoPassword;
    } catch (error: any) {
      throw new BadRequestError({
        code: 500,
        message: `Error fetching user: ${error.message}`,
        logging: true,
      });
    }
  }

  async findAllUsers(): Promise<Omit<UserData, "password">[]> {
    try {
      const usersRef = admin.database().ref("gma/users");
      const snapshot = await usersRef.once("value");

      if (!snapshot.exists()) {
        return [];
      }

      const usersData = snapshot.val();
      const usersList: Omit<UserData, "password">[] = Object.keys(
        usersData
      ).map((key) => {
        const { password, ...userWithNoPassword } = usersData[key];
        return { id: key, ...userWithNoPassword };
      });

      return usersList;
    } catch (error: any) {
      throw new BadRequestError({
        code: 500,
        message: `Error fetching users: ${error.message}`,
        logging: true,
      });
    }
  }

  private generateTokens(payload: Omit<ITokenPayload, "type">): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = sign({ ...payload, type: "access" }, this.SECRET_KEY, {
      subject: payload.id,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = sign(
      { ...payload, type: "refresh" },
      this.REFRESH_SECRET_KEY,
      {
        subject: payload.id,
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
      }
    );

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    try {
      const tokenRef = admin.database().ref(`gma/refreshTokens/${userId}`);
      await tokenRef.push({
        token: refreshToken,
        createdAt: admin.database.ServerValue.TIMESTAMP,
        isActive: true,
      });
    } catch (error) {
      console.error("Error storing refresh token:", error);
    }
  }

  private async validateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<boolean> {
    try {
      const tokensRef = admin.database().ref(`gma/refreshTokens/${userId}`);
      const snapshot = await tokensRef.once("value");

      if (!snapshot.exists()) {
        return false;
      }

      const tokens = snapshot.val();
      const tokenExists = Object.values(tokens).some(
        (tokenData: any) =>
          tokenData.token === refreshToken && tokenData.isActive
      );

      return tokenExists;
    } catch (error) {
      console.error("Error validating refresh token:", error);
      return false;
    }
  }

  private async invalidateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    try {
      const tokensRef = admin.database().ref(`gma/refreshTokens/${userId}`);
      const snapshot = await tokensRef.once("value");

      if (snapshot.exists()) {
        const tokens = snapshot.val();
        const tokenKey = Object.keys(tokens).find(
          (key) => tokens[key].token === refreshToken
        );

        if (tokenKey) {
          await tokensRef.child(tokenKey).update({ isActive: false });
        }
      }
    } catch (error) {
      console.error("Error invalidating refresh token:", error);
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    try {
      if (refreshToken) {
        // Invalidate specific refresh token
        await this.invalidateRefreshToken(userId, refreshToken);
      } else {
        // Invalidate all refresh tokens for user
        const tokensRef = admin.database().ref(`gma/refreshTokens/${userId}`);
        const snapshot = await tokensRef.once("value");

        if (snapshot.exists()) {
          const tokens = snapshot.val();
          const updates: { [key: string]: any } = {};

          Object.keys(tokens).forEach((key) => {
            updates[`${key}/isActive`] = false;
          });

          await tokensRef.update(updates);
        }
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  verifyAccessToken(token: string): ITokenPayload {
    try {
      const decoded = verify(token, this.SECRET_KEY) as JwtPayload &
        ITokenPayload;

      if (decoded.type !== "access") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error: any) {
      throw new BadRequestError({
        code: 401,
        message: "Token de acesso invalido ou expirado",
        logging: true,
      });
    }
  }
}

export default AuthService;

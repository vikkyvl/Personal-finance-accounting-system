import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserServiceBuilder } from './user.service.builder'

describe('User Service (unit)', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            generateTokens: jest.fn().mockResolvedValue({
              accessToken: UserServiceBuilder.MOCK_ACCESS_TOKEN,
              refreshToken: UserServiceBuilder.MOCK_REFRESH_TOKEN,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    authService = module.get(AuthService);
  });

  describe('createUser()', () => {
    let dto: ReturnType<typeof UserServiceBuilder.validUserDtoWithPassword>;
    let createdUser: ReturnType<typeof UserServiceBuilder.validUserEntity>;

    beforeEach(() => {
      dto = UserServiceBuilder.validUserDtoWithPassword();
      createdUser = UserServiceBuilder.validUserEntity();

      userRepository.create.mockReturnValue(createdUser);
      userRepository.save.mockResolvedValue(createdUser);
    });

    it('should create and save a new user', async () => {
      await service.createUser(dto);

      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: dto.email,
        password: dto.password,
        username: dto.username,
        role: dto.role,
      }));

      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
    });

    it('should return access and refresh tokens', async () => {
      const actual = await service.createUser(dto);

      expect(authService.generateTokens).toHaveBeenCalledWith({
        member_id: createdUser.id,
        role: createdUser.role,
      });

      expect(actual).toEqual({
        accessToken: UserServiceBuilder.MOCK_ACCESS_TOKEN,
        refreshToken: UserServiceBuilder.MOCK_REFRESH_TOKEN,
      });
    });

    it('should generate default password if none provided', async () => {
      const dtoWithoutPassword = UserServiceBuilder.validUserDtoWithoutPassword();

      await service.createUser(dtoWithoutPassword);

      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: dtoWithoutPassword.email,
        username: dtoWithoutPassword.username,
        role: dtoWithoutPassword.role,
        password: expect.any(String),
      }));
    });
  });

  describe('login()', () => {
    let user: ReturnType<typeof UserServiceBuilder.validUserEntity>;
    let dto: ReturnType<typeof UserServiceBuilder.validUserLogin>;

    beforeEach(() => {
      user = UserServiceBuilder.validUserEntity();
      dto = UserServiceBuilder.validUserLogin();

      userRepository.findOne.mockResolvedValue(user);
      authService.generateTokens.mockResolvedValue({
        accessToken: UserServiceBuilder.MOCK_ACCESS_TOKEN,
        refreshToken: UserServiceBuilder.MOCK_REFRESH_TOKEN,
      });
    });

    it('should call findOne with correct email', async () => {
      await service.login(dto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
    });

    it('should call generateTokens with correct payload', async () => {
      await service.login(dto);

      expect(authService.generateTokens).toHaveBeenCalledWith({
        member_id: user.id,
        role: user.role,
      });
    });

    it('should return access and refresh tokens', async () => {
      const actual = await service.login(dto);

      expect(actual).toEqual({
        accessToken: UserServiceBuilder.MOCK_ACCESS_TOKEN,
        refreshToken: UserServiceBuilder.MOCK_REFRESH_TOKEN,
      });
    });

    it('should throw an error if user is not found', async () => {
      const dtoWithInvalidEmail = UserServiceBuilder.invalidUserEmail();

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(dtoWithInvalidEmail)).rejects.toThrow('Invalid email or password');
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: dtoWithInvalidEmail.email } });
    });

    it('should throw an error if password is incorrect', async () => {
      const dtoWithInvalidPassword = UserServiceBuilder.invalidUserPassword();

      userRepository.findOne.mockResolvedValue(user);

      await expect(service.login(dtoWithInvalidPassword)).rejects.toThrow('Invalid email or password');
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: dtoWithInvalidPassword.email } });
    });
  });

  describe('findUserById()', () => {
    it('should find a user by ID', async () => {
      const user = UserServiceBuilder.validUserEntity();
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findUserById(user.id);

      expect(result).toEqual(user);
    });
  });

  describe('findUserByEmail()', () => {
    it('should find a user by email', async () => {
      const user = UserServiceBuilder.validUserEntity();
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findUserByEmail(user.email);

      expect(result).toEqual(user);
    });
  });

  describe('updateUser()', () => {
    let user: ReturnType<typeof UserServiceBuilder.validUserEntity>;
    let dto: ReturnType<typeof UserServiceBuilder.validUserDtoWithPassword>;

    beforeEach(() => {
      user = UserServiceBuilder.validUserEntity();
      dto = UserServiceBuilder.updatedUserDto();
    });

    it('should update an existing user', async () => {
      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue({ ...user, ...dto });

      const result = await service.updateUser(user.id, dto);

      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: user.id,
        username: dto.username,
      }));
      expect(result).toEqual({ ...user, ...dto });
    });

    it('should throw an error if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUser(UserServiceBuilder.NON_EXISTING_ID, dto)).rejects.toThrow('User not found');
    });
  });

  describe('deleteUser()', () => {
    let user: ReturnType<typeof UserServiceBuilder.validUserEntity>;

    beforeEach(() => {
      user = UserServiceBuilder.validUserEntity();
    });

    it('should delete the user if found', async () => {
      userRepository.findOne.mockResolvedValue(user);
      userRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.deleteUser(user.id);

      expect(userRepository.delete).toHaveBeenCalledWith(user.id);
      expect(result).toEqual({ affected: 1, raw: {} });
    });

    it('should throw an error if the user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteUser(UserServiceBuilder.NON_EXISTING_ID),).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword()', () => {
    let user: ReturnType<typeof UserServiceBuilder.validUserEntity>;

    beforeEach(() => {
      user = UserServiceBuilder.validUserEntity();
    });

    it('should reset password if user is found', async () => {
      userRepository.findOne.mockResolvedValue(user);
      const updatedUser = { ...user, password: '123456' };
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.resetPassword(user.email);

      expect(userRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(UserServiceBuilder.invalidUserEmail().email)).rejects.toThrow('User not found');
    });
  });
});
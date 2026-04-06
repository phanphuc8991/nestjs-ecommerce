import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({
    type: [
      {
        provider: String,
        providerId: String,
      },
    ],
    _id: false,
  })
  socialLinks: Array<{ provider: string; providerId: string }>;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  image: string;

  @Prop()
  role: string;

  @Prop({
    type: String,
    enum: ['LOCAL', 'GOOGLE', 'FACEBOOK'],
    default: 'LOCAL',
  })
  accountType: string;

  @Prop({ default: 'inactive' })
  status: string;

  @Prop()
  avatarPublicIdar: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  codeId: string;

  @Prop()
  codeExpired: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

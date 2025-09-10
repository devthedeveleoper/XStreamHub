import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        
        if (user && (await user.comparePassword(credentials.password))) {
          return user;
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
        if (account.provider === 'google' || account.provider === 'github') {
            await dbConnect();
            try {
                let existingUser = await User.findOne({ email: profile.email });
                if (existingUser) {
                    if (profile.avatar_url || profile.picture) {
                       existingUser.avatar = profile.avatar_url || profile.picture;
                       await existingUser.save();
                    }
                    user.id = existingUser._id.toString();
                    user.username = existingUser.username;
                    user.avatar = existingUser.avatar;
                    return true;
                }

                const newUser = new User({
                    email: profile.email,
                    username: profile.login || profile.name.replace(/\s/g, ''),
                    avatar: profile.avatar_url || profile.picture,
                    password: Math.random().toString(36).slice(-8)
                });
                await newUser.save();
                user.id = newUser._id.toString();
                user.username = newUser.username;
                user.avatar = newUser.avatar;
                return true;
            } catch (error) {
                console.error("OAuth SignIn Error:", error);
                return false;
            }
        }
        return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user._id;
        token.username = user.username;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.username;
        session.user.image = token.avatar;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };